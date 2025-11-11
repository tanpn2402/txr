import type { TypeAny } from '@/types/TypeAny';

import { ConfigUtils } from './config-utils';

// Simple deterministic AES-256-CBC in browser (Web Crypto)
// - Key derived from passphrase via SHA-256 (deterministic)
// - Static IV (16 zero bytes) -> deterministic output
// - Returns Base64 string for storage/transfer

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// derive a 32-byte key from a passphrase using SHA-256 (deterministic)
async function deriveKeyFromPassphrase(passphrase: string) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(passphrase));
  // import the 32-byte hash as AES-CBC key
  return crypto.subtle.importKey('raw', hash, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

// helper: ArrayBuffer -> base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// helper: base64 -> Uint8Array
function base64ToUint8Array(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const ZERO_IV = new Uint8Array(16); // 16 bytes of zeros (static IV)

async function encryptPinStatic(pin: string, passphrase: string) {
  const key = await deriveKeyFromPassphrase(passphrase);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ZERO_IV },
    key,
    encoder.encode(String(pin))
  );
  // return base64
  return arrayBufferToBase64(ciphertext);
}

async function decryptPinStatic(encryptedB64: string, passphrase: string) {
  const key = await deriveKeyFromPassphrase(passphrase);
  const ct = base64ToUint8Array(encryptedB64);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: ZERO_IV }, key, ct);
  return decoder.decode(plainBuf);
}

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

export const _encryptPin = async (rawPin: string) => {
  const { key } = await importKeyFromPassphrase(ConfigUtils.ENCRYPTION_SECRET);
  return await encryptPinBrowser(rawPin, key);
};

export const _decryptPin = async (encryptedPin: string) => {
  const { key } = await importKeyFromPassphrase(ConfigUtils.ENCRYPTION_SECRET);
  return await decryptPinBrowser(encryptedPin, key);
};

export const encryptPin = async (rawPin: string) => {
  return encryptPinStatic(rawPin, ConfigUtils.ENCRYPTION_SECRET);
};

export const decryptPin = async (encryptedPin: string) => {
  return decryptPinStatic(encryptedPin, ConfigUtils.ENCRYPTION_SECRET);
};

// assign to window
(window as TypeAny).encryptPin = encryptPin;
