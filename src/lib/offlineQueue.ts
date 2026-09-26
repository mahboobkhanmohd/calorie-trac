/**
 * Offline Sync Queue Manager for CALORA
 * Queues food log additions, edits, deletions, custom foods, and profile updates
 * when offline and seamlessly drains/synchronizes to Firebase Firestore upon reconnection.
 */

import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export type QueueActionType =
  | 'ADD_FOOD_ENTRY'
  | 'UPDATE_FOOD_ENTRY'
  | 'DELETE_FOOD_ENTRY'
  | 'ADD_CUSTOM_FOOD'
  | 'UPDATE_PROFILE';

export interface QueueItem {
  id: string;
  action: QueueActionType;
  userId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY_QUEUE = 'calora_offline_sync_queue_v2';

export class OfflineQueueManager {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private listeners: Array<(queue: QueueItem[], status: 'idle' | 'syncing' | 'offline') => void> = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineQueue] Connection restored, processing pending sync queue...');
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('[OfflineQueue] Network went offline, queuing enabled.');
        this.notifyListeners('offline');
      });
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[OfflineQueue] Failed to load queue from storage:', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[OfflineQueue] Failed to persist queue to storage:', e);
    }
  }

  public subscribe(listener: (queue: QueueItem[], status: 'idle' | 'syncing' | 'offline') => void) {
    this.listeners.push(listener);
    listener(this.queue, !navigator.onLine ? 'offline' : 'idle');
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(status: 'idle' | 'syncing' | 'offline') {
    this.listeners.forEach((l) => l([...this.queue], status));
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getQueue(): QueueItem[] {
    return [...this.queue];
  }

  public enqueue(action: QueueActionType, userId: string, payload: any): QueueItem {
    const item: QueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      action,
      userId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // If update/delete on the same entry exists, we can append or coalesce
    this.queue.push(item);
    this.saveQueue();
    this.notifyListeners(!navigator.onLine ? 'offline' : 'idle');

    console.log(`[OfflineQueue] Enqueued ${action} (Pending: ${this.queue.length})`);

    // If online, try to drain immediately
    if (navigator.onLine) {
      this.processQueue();
    }

    return item;
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    this.notifyListeners('syncing');

    const itemsToProcess = [...this.queue];
    const successfulIds: string[] = [];

    for (const item of itemsToProcess) {
      try {
        await this.executeItem(item);
        successfulIds.push(item.id);
      } catch (err: any) {
        console.warn(`[OfflineQueue] Sync failed for ${item.action} (${item.id}):`, err);
        item.retryCount += 1;
        // If it's a genuine network offline error, stop processing rest of queue until online
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          break;
        }
        // If max retries reached on unrecoverable error, drop it to avoid blocking
        if (item.retryCount >= 5) {
          console.error(`[OfflineQueue] Max retries reached for ${item.id}, discarding.`);
          successfulIds.push(item.id);
        }
      }
    }

    // Filter out synced items
    if (successfulIds.length > 0) {
      this.queue = this.queue.filter((item) => !successfulIds.includes(item.id));
      this.saveQueue();
      console.log(`[OfflineQueue] Successfully synced ${successfulIds.length} items. Remaining: ${this.queue.length}`);
    }

    this.isProcessing = false;
    this.notifyListeners(!navigator.onLine ? 'offline' : 'idle');
  }

  private async executeItem(item: QueueItem): Promise<void> {
    const { action, userId, payload } = item;

    switch (action) {
      case 'ADD_FOOD_ENTRY': {
        const entryDoc = doc(db, 'users', userId, 'foodEntries', payload.id);
        await setDoc(entryDoc, {
          ...payload,
          userId,
          updatedAt: new Date().toISOString(),
        });
        break;
      }
      case 'UPDATE_FOOD_ENTRY': {
        const entryDoc = doc(db, 'users', userId, 'foodEntries', payload.id);
        await updateDoc(entryDoc, {
          ...payload.updates,
          updatedAt: new Date().toISOString(),
        });
        break;
      }
      case 'DELETE_FOOD_ENTRY': {
        const entryDoc = doc(db, 'users', userId, 'foodEntries', payload.id);
        await deleteDoc(entryDoc);
        break;
      }
      case 'ADD_CUSTOM_FOOD': {
        const foodDoc = doc(db, 'users', userId, 'customFoods', payload.id);
        await setDoc(foodDoc, {
          ...payload,
          userId,
        });
        break;
      }
      case 'UPDATE_PROFILE': {
        const userDoc = doc(db, 'users', userId);
        await setDoc(
          userDoc,
          {
            ...payload,
            uid: userId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        break;
      }
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
