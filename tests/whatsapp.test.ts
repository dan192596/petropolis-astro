import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, getMessage } from '../src/lib/whatsapp';
import { site } from '../src/data/site';

describe('buildWhatsAppUrl', () => {
  it('builds a URL with an encoded literal message', () => {
    const url = buildWhatsAppUrl('Hola mundo');
    expect(url).toBe('https://wa.me/50245867364?text=Hola%20mundo');
  });

  it('encodes special characters', () => {
    const url = buildWhatsAppUrl('¡Hola! ¿Cómo está?');
    expect(url).toContain('%C2%A1Hola'); // ¡ encoded, ! is safe and stays raw
    expect(url).toContain('%C3%A1'); // á
    expect(url).toContain('%3F'); // ?
  });

  it('returns base URL with no text param if message is empty', () => {
    expect(buildWhatsAppUrl('')).toBe('https://wa.me/50245867364');
  });
});

describe('getMessage', () => {
  it('returns the literal string for known keys', () => {
    expect(getMessage('grooming')).toBe(site.messages.grooming);
    expect(getMessage('vet')).toBe(site.messages.vet);
  });

  it('passes through arbitrary strings as-is', () => {
    expect(getMessage('Custom message text')).toBe('Custom message text');
  });
});
