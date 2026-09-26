import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Radio, AlertCircle } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';

export const LiveVoiceModal: React.FC = () => {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen, todayTotals, profile, selectedDateTotals } = useNutrition();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'calora'; text: string; time: string }>>([
    {
      sender: 'calora',
      text: `Hello! I am CALORA Live Voice, powered by Gemini 3.8 Live. Ask me about your metabolic targets, food intake, or speak to log entries in real-time.`,
      time: 'Now',
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const scheduledTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to WebSocket when modal is open
  useEffect(() => {
    if (!isVoiceAssistantOpen) {
      disconnectSession();
      return;
    }

    connectSession();

    return () => {
      disconnectSession();
    };
  }, [isVoiceAssistantOpen]);

  const connectSession = () => {
    setErrorMessage(null);
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Gemini Live WebSocket');
        setIsConnected(true);

        // Send initial context to prime the metabolic model
        const contextPayload = {
          text: `[SYSTEM CONTEXT: The user is currently in CALORA. Today's calorie target: ${profile.targetCalories} kcal. Consumed so far: ${todayTotals.calories} kcal. Remaining: ${profile.targetCalories - todayTotals.calories} kcal. Protein: ${todayTotals.protein}/${profile.targetProtein}g. Carbs: ${todayTotals.carbs}/${profile.targetCarbs}g. Fats: ${todayTotals.fat}/${profile.targetFat}g. Fiber: ${todayTotals.fiber}/${profile.targetFiber}g. Goal: ${profile.goal}].`,
        };
        ws.send(JSON.stringify(contextPayload));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setErrorMessage(data.error);
            setIsSpeaking(false);
            return;
          }

          if (data.interrupted) {
            // Stop current playback immediately
            stopAllAudioPlayback();
            setIsSpeaking(false);
          }

          if (data.text) {
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.sender === 'calora' && lastMsg.time === 'Just now') {
                return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + ' ' + data.text }];
              }
              return [
                ...prev,
                {
                  sender: 'calora',
                  text: data.text,
                  time: 'Just now',
                },
              ];
            });
          }

          if (data.audio && !isMuted) {
            setIsSpeaking(true);
            playAudioChunk(data.audio);
          }

          if (data.turnComplete) {
            setTimeout(() => {
              setIsSpeaking(false);
            }, 800);
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setErrorMessage('Failed to connect to Live API session.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };
    } catch (e) {
      console.error('WS init failed:', e);
      setErrorMessage(e instanceof Error ? e.message : 'Connection failed');
    }
  };

  const disconnectSession = () => {
    stopMicrophone();
    stopAllAudioPlayback();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  // Convert Float32 array from mic to 16-bit PCM base64 string
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const l = float32Array.length;
    const int16Array = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Play audio chunk received from model (24kHz, 1-channel 16-bit PCM)
  const playAudioChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binaryStr = window.atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (scheduledTimeRef.current < currentTime) {
        scheduledTimeRef.current = currentTime;
      }

      source.start(scheduledTimeRef.current);
      scheduledTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Audio chunk playback failed:', e);
    }
  };

  const stopAllAudioPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      scheduledTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  };

  // Toggle microphone recording
  const toggleMicrophone = async () => {
    if (isListening) {
      stopMicrophone();
    } else {
      await startMicrophone();
    }
  };

  const startMicrophone = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone access is not supported in this browser. You can type below to chat with Live AI!');
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (firstErr) {
        // Fallback to basic audio constraint if specific constraints trigger OverconstrainedError
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // ScriptProcessorNode for wide browser compatibility
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Audio = pcmToBase64(inputData);
        wsRef.current.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err: any) {
      console.warn('Mic access issue:', err);
      const isDeviceNotFound =
        err?.name === 'NotFoundError' ||
        err?.name === 'DevicesNotFoundError' ||
        err?.name === 'OverconstrainedError' ||
        (err?.message && (err.message.includes('Requested device not found') || err.message.includes('not found')));

      const isPermissionDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        (err?.message && err.message.includes('denied'));

      if (isDeviceNotFound) {
        setErrorMessage('No microphone device detected on this system. You can chat by typing below or tapping any quick prompt!');
      } else if (isPermissionDenied) {
        setErrorMessage('Microphone permission denied. You can enable it in your browser settings or type below!');
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Microphone unavailable. You can type your questions below.');
      }
      setIsListening(false);
    }
  };

  const stopMicrophone = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ endAudio: true }));
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userText = textInput.trim();
    setTextInput('');

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        time: 'Just now',
      },
    ]);

    wsRef.current.send(JSON.stringify({ text: userText }));
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: prompt,
        time: 'Just now',
      },
    ]);
    wsRef.current.send(JSON.stringify({ text: prompt }));
  };

  if (!isVoiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141416] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#19191C]">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B4A]/20 to-[#9B7BFF]/20 border border-[#FF6B4A]/30">
              <Radio className={`w-5 h-5 ${isConnected ? 'text-[#FF6B4A] animate-pulse' : 'text-gray-500'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">CALORA Live AI</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-white/50">
                {isSpeaking
                  ? 'Speaking...'
                  : isListening
                  ? 'Listening in real-time...'
                  : isConnected
                  ? 'Ready · Tap mic to speak'
                  : 'Connecting to Live API...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
              className="p-2 text-white/60 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVoiceAssistantOpen(false)}
              className="p-2 text-white/60 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient status indicator & Animated Voice Core */}
        <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#19191C]/60 to-transparent">
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* Wave Rings */}
            <div
              className={`absolute inset-0 rounded-full border border-[#FF6B4A]/20 transition-all duration-700 ${
                isSpeaking
                  ? 'scale-125 border-[#9B7BFF]/50 animate-ping'
                  : isListening
                  ? 'scale-110 border-[#FF6B4A]/60 animate-pulse'
                  : 'scale-90 opacity-40'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full border border-[#4D8DFF]/30 transition-all duration-500 ${
                isSpeaking || isListening ? 'scale-110' : 'scale-95'
              }`}
            />

            {/* Main Interactive Mic Button */}
            <button
              onClick={toggleMicrophone}
              disabled={!isConnected}
              className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-gradient-to-tr from-[#FF6B4A] to-[#FF8A65] text-white shadow-[#FF6B4A]/30 scale-105'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-[#9B7BFF] to-[#4D8DFF] text-white shadow-[#9B7BFF]/30 scale-100'
                  : 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/15'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <MicOff className="w-10 h-10 text-white/60" />
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <span
              className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                isListening
                  ? 'bg-[#FF6B4A]/20 text-[#FF6B4A] border border-[#FF6B4A]/30'
                  : isSpeaking
                  ? 'bg-[#9B7BFF]/20 text-[#9B7BFF] border border-[#9B7BFF]/30'
                  : 'bg-white/5 text-white/50 border border-white/5'
              }`}
            >
              {isListening ? 'Streaming Mic (16kHz PCM)' : isSpeaking ? 'Live Voice Output (24kHz)' : 'Mic Idle'}
            </span>
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 mt-3 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar border-y border-white/5 bg-black/20">
          <span className="text-[11px] uppercase tracking-wider text-white/40 shrink-0 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF6B4A]" /> Prompts:
          </span>
          <button
            onClick={() => handleQuickPrompt("What's my remaining calorie balance for today?")}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 whitespace-nowrap border border-white/5 transition-colors"
          >
            Calorie remaining?
          </button>
          <button
            onClick={() => handleQuickPrompt('Give me a high protein lunch idea under 600 calories.')}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 whitespace-nowrap border border-white/5 transition-colors"
          >
            Lunch recommendation
          </button>
          <button
            onClick={() => handleQuickPrompt('How are my protein and fiber macros pacing today?')}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 whitespace-nowrap border border-white/5 transition-colors"
          >
            Macro breakdown
          </button>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[180px] max-h-[260px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.sender === 'user'
                    ? 'bg-[#FF6B4A] text-white rounded-br-none'
                    : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
              </div>
              <span className="text-[10px] text-white/30 mt-1 px-1">{m.sender === 'user' ? 'You' : 'CALORA Live'}</span>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Fallback Text Input Form */}
        <form onSubmit={handleSendText} className="p-4 border-t border-white/5 bg-[#19191C] flex items-center space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a message or question to Gemini Live..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF6B4A]"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || !isConnected}
            className="p-2.5 rounded-xl bg-[#FF6B4A] text-white disabled:opacity-40 hover:bg-[#FF8A65] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
