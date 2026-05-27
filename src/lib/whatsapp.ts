import { site, type MessageKey } from '../data/site';

const KNOWN_KEYS = new Set<MessageKey>([
  'general',
  'grooming',
  'vet',
  'products',
  'emergency',
]);

export function getMessage(keyOrText: MessageKey | string): string {
  if ((KNOWN_KEYS as Set<string>).has(keyOrText)) {
    return site.messages[keyOrText as MessageKey];
  }
  return keyOrText;
}

export function buildWhatsAppUrl(message: string): string {
  if (!message) return site.whatsapp.base;
  return `${site.whatsapp.base}?text=${encodeURIComponent(message)}`;
}
