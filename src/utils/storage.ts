import { STORAGE_KEYS } from '../constants/config';
import { StoredThreads, StoredMessages } from '../types/thread';
import { Message } from '../types/api';

/**
 * Local storage utilities for persisting threads and messages.
 */

export const storage = {
  /**
   * Get all threads from localStorage.
   */
  getThreads(): StoredThreads | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THREADS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get threads from localStorage:', error);
      return null;
    }
  },

  /**
   * Save threads to localStorage.
   */
  saveThreads(threads: StoredThreads): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
    } catch (error) {
      console.error('Failed to save threads to localStorage:', error);
    }
  },

  /**
   * Get messages for a specific thread from localStorage.
   */
  getMessages(threadId: string): Message[] {
    try {
      const data = localStorage.getItem(
        `${STORAGE_KEYS.MESSAGES_PREFIX}${threadId}`
      );

      if (!data) {
        return [];
      }

      const stored: StoredMessages = JSON.parse(data);
      return stored.messages || [];
    } catch (error) {
      console.error('Failed to get messages from localStorage:', error);
      return [];
    }
  },

  /**
   * Save messages for a specific thread to localStorage.
   */
  saveMessages(threadId: string, messages: Message[]): void {
    try {
      const stored: StoredMessages = {
        threadId,
        messages,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        `${STORAGE_KEYS.MESSAGES_PREFIX}${threadId}`,
        JSON.stringify(stored)
      );
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  },

  /**
   * Clear all messages for a specific thread from localStorage.
   */
  clearThread(threadId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${threadId}`);
    } catch (error) {
      console.error('Failed to clear thread from localStorage:', error);
    }
  },

  /**
   * Clear all data from localStorage.
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.THREADS);

      // Clear all message entries
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data from localStorage:', error);
    }
  },
};
