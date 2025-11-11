import type { TypeAny } from '@/types/TypeAny';

import { ConfigUtils } from './config-utils';

async function importKeyFromPassphrase(passphrase: string) {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const salt = enc.encode(ConfigUtils.ENCRYPTION_KEY);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return { key, salt: Array.from(salt) };
}

async function encryptPinBrowser(pin: string, cryptoKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(pin));
  // return base64 iv + ciphertext
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptPinBrowser(b64: string, cryptoKey: CryptoKey) {
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ct = raw.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
  return new TextDecoder().decode(decrypted);
}

export const encryptPin = async (rawPin: string) => {
  const { key } = await importKeyFromPassphrase(ConfigUtils.ENCRYPTION_SECRET);
  return await encryptPinBrowser(rawPin, key);
};

export const decryptPin = async (encryptedPin: string) => {
  const { key } = await importKeyFromPassphrase(ConfigUtils.ENCRYPTION_SECRET);
  return await decryptPinBrowser(encryptedPin, key);
};

// assign to window
(window as TypeAny).encryptPin = encryptPin;
