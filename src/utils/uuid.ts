import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4.
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Generate a unique message ID.
 */
export function generateMessageId(): string {
  return `msg_${generateUUID()}`;
}

/**
 * Validate if a string is a valid UUID.
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
