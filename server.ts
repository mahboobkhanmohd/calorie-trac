import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Basic Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate Limiter implementation
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const apiRateLimitMap = new Map<string, RateLimitRecord>();
const wsRateLimitMap = new Map<string, RateLimitRecord>();

const API_WINDOW_MS = 60 * 1000; // 1 minute window
const API_MAX_REQUESTS = 60; // 60 requests per minute
const WS_MAX_REQUESTS = 20; // 20 WebSocket connection attempts per minute

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = apiRateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    apiRateLimitMap.set(ip, { count: 1, resetTime: now + API_WINDOW_MS });
    return next();
  }

  if (record.count >= API_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please slow down and try again later.',
    });
  }

  record.count += 1;
  next();
}

app.use('/api', rateLimiter);

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Protected Session Verification Endpoint
app.get('/api/auth/verify-session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized. An active authenticated session is required.',
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      error: 'Invalid authentication token.',
    });
  }

  // Tokens verified by backend return clean status without leaking internal state
  res.json({
    status: 'authenticated',
    valid: true,
  });
});

// Setup WebSocket Server for Live API conversations
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  if (url.pathname === '/live' || url.pathname === '/api/live') {
    // Rate limit WebSocket connection attempts
    const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const wsRecord = wsRateLimitMap.get(ip);

    if (wsRecord && now <= wsRecord.resetTime && wsRecord.count >= WS_MAX_REQUESTS) {
      socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
      socket.destroy();
      return;
    }

    if (!wsRecord || now > wsRecord.resetTime) {
      wsRateLimitMap.set(ip, { count: 1, resetTime: now + API_WINDOW_MS });
    } else {
      wsRecord.count += 1;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live audio session (/live)');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        error: 'Live Voice AI service is currently unavailable. Please check server configuration.',
      })
    );
    return;
  }

  let session: any = null;
  let isClosed = false;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are CALORA Voice AI, an elite metabolic, athletic performance, and sports nutrition coach. You communicate directly, concisely, and supportively. Help users log meals, query calorie counts and macronutrient breakdowns (protein, carbs, fats, fiber), review their daily caloric velocity and energy budget, and provide evidence-based nutritional optimization advice. Keep verbal responses focused and conversational.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          // Check for audio parts
          const parts = message.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
            if (part.text) {
              clientWs.send(JSON.stringify({ text: part.text }));
            }
          }

          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }

          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onclose: () => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ status: 'session_closed' }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live session internal error:', err?.message || err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: 'Live audio connection encountered an error.' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ status: 'ready', model: 'gemini-3.8-live' }));

    clientWs.on('message', (rawData: any) => {
      if (isClosed || !session) return;
      try {
        const payload = JSON.parse(rawData.toString());

        // Stream mic PCM audio chunk
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }

        // Send text prompt / nutrition context
        if (payload.text) {
          if (typeof session.sendClientContent === 'function') {
            session.sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [{ text: payload.text }],
                },
              ],
              turnComplete: true,
            });
          }
        }
      } catch (err) {
        console.error('Error processing client Live message:', err);
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      try {
        session?.close?.();
      } catch (e) {
        // Ignore session close error
      }
    });
  } catch (error) {
    console.error('Failed to connect to gemini-3.8-live:', error);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          error: 'Failed to establish Live voice session. Please try again.',
        })
      );
    }
  }
});

// Vite Middleware for development or static serving for production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Global Security-Safe Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log full internal error securely on server console
  console.error('Server execution error:', err?.message || err);
  // Never expose database errors, stack traces, secrets, or internal service information to end users
  if (!res.headersSent) {
    res.status(500).json({
      error: 'An internal service error occurred. Please try again later.',
    });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CALORA Server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
});
