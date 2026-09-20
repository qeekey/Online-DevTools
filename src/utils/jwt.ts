// Base64URL and JWT helper utilities using modern Web Crypto API

/**
 * Encodes a UTF-8 string or Uint8Array into a Base64URL string.
 */
export function base64UrlEncode(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = input;
  }

  // Convert binary bytes to binary string
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a Base64URL string to a UTF-8 string.
 */
export function base64UrlDecode(str: string): string {
  // Convert Base64URL to regular Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' until length is a multiple of 4
  const pad = base64.length % 4;
  if (pad === 2) {
    base64 += '==';
  } else if (pad === 3) {
    base64 += '=';
  } else if (pad === 1) {
    throw new Error('Base64URL 长度无效，无法解码');
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

/**
 * Converts Base64URL to a raw Uint8Array (useful for signature bytes).
 */
export function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 2) base64 += '==';
  else if (pad === 3) base64 += '=';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export type SupportedJwtAlg = 'HS256' | 'HS384' | 'HS512' | 'none';

export interface DecodedJWT {
  raw: string;
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
  header: any;
  payload: any;
  headerPretty: string;
  payloadPretty: string;
  error?: string;
  claimsInfo: {
    iat?: { value: number; formatted: string };
    exp?: { value: number; formatted: string; isExpired: boolean; relative: string };
    nbf?: { value: number; formatted: string; isValidYet: boolean };
    iss?: string;
    sub?: string;
    aud?: string | string[];
    jti?: string;
  };
}

/**
 * Format unix timestamp (seconds) into human-readable local time
 */
export function formatUnixTimestamp(seconds: number): string {
  try {
    const d = new Date(seconds * 1000);
    if (isNaN(d.getTime())) return '无效时间戳';
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '无效时间戳';
  }
}

/**
 * Decodes a JWT token without verifying the signature.
 */
export function decodeJwtToken(token: string): DecodedJWT {
  const trimmed = token.trim();
  const parts = trimmed.split('.');

  if (parts.length < 2 || parts.length > 3) {
    throw new Error('JWT 格式无效，标准的 JWT 需包含通过点 (.) 分隔的 Header、Payload 和 Signature 2 或 3 个部分');
  }

  const [headerPart, payloadPart, signaturePart = ''] = parts;

  let headerRaw = '';
  let payloadRaw = '';
  let headerObj: any = {};
  let payloadObj: any = {};

  try {
    headerRaw = base64UrlDecode(headerPart);
    headerObj = JSON.parse(headerRaw);
  } catch (err: any) {
    throw new Error(`无法解析 JWT Header: ${err.message || '非标准 Base64URL 或 JSON'}`);
  }

  try {
    payloadRaw = base64UrlDecode(payloadPart);
    payloadObj = JSON.parse(payloadRaw);
  } catch (err: any) {
    throw new Error(`无法解析 JWT Payload: ${err.message || '非标准 Base64URL 或 JSON'}`);
  }

  // Parse claims info
  const now = Math.floor(Date.now() / 1000);
  const claimsInfo: DecodedJWT['claimsInfo'] = {};

  if (typeof payloadObj.iat === 'number') {
    claimsInfo.iat = {
      value: payloadObj.iat,
      formatted: formatUnixTimestamp(payloadObj.iat),
    };
  }

  if (typeof payloadObj.exp === 'number') {
    const isExpired = payloadObj.exp <= now;
    const diffSec = Math.abs(payloadObj.exp - now);
    let relative = '';
    if (diffSec < 60) relative = `${diffSec} 秒`;
    else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)} 分钟`;
    else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)} 小时`;
    else relative = `${Math.floor(diffSec / 86400)} 天`;

    claimsInfo.exp = {
      value: payloadObj.exp,
      formatted: formatUnixTimestamp(payloadObj.exp),
      isExpired,
      relative: isExpired ? `已过期 (${relative}前)` : `有效中 (剩余约 ${relative})`,
    };
  }

  if (typeof payloadObj.nbf === 'number') {
    claimsInfo.nbf = {
      value: payloadObj.nbf,
      formatted: formatUnixTimestamp(payloadObj.nbf),
      isValidYet: now >= payloadObj.nbf,
    };
  }

  if (payloadObj.iss) claimsInfo.iss = String(payloadObj.iss);
  if (payloadObj.sub) claimsInfo.sub = String(payloadObj.sub);
  if (payloadObj.aud) claimsInfo.aud = payloadObj.aud;
  if (payloadObj.jti) claimsInfo.jti = String(payloadObj.jti);

  return {
    raw: trimmed,
    headerRaw,
    payloadRaw,
    signatureRaw: signaturePart,
    header: headerObj,
    payload: payloadObj,
    headerPretty: JSON.stringify(headerObj, null, 2),
    payloadPretty: JSON.stringify(payloadObj, null, 2),
    claimsInfo,
  };
}

/**
 * Gets Web Crypto hash algorithm name
 */
function getHashName(alg: SupportedJwtAlg): string {
  switch (alg) {
    case 'HS256':
      return 'SHA-256';
    case 'HS384':
      return 'SHA-384';
    case 'HS512':
      return 'SHA-512';
    default:
      throw new Error(`暂不支持的 HMAC 算法: ${alg}`);
  }
}

/**
 * Sign JWT using Web Crypto API
 */
export async function signJwt(
  headerObj: any,
  payloadObj: any,
  secret: string,
  alg: SupportedJwtAlg = 'HS256',
  secretIsBase64: boolean = false
): Promise<string> {
  const headerStr = JSON.stringify(headerObj);
  const payloadStr = JSON.stringify(payloadObj);

  const encodedHeader = base64UrlEncode(headerStr);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (alg === 'none') {
    return `${signingInput}.`;
  }

  if (!secret) {
    throw new Error('生成带签名的 JWT 时，秘钥 (Secret) 不能为空');
  }

  let secretBytes: Uint8Array;
  if (secretIsBase64) {
    try {
      secretBytes = base64UrlToBytes(secret);
    } catch {
      secretBytes = new TextEncoder().encode(secret);
    }
  } else {
    secretBytes = new TextEncoder().encode(secret);
  }

  const hashName = getHashName(alg);
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: { name: hashName } },
    false,
    ['sign']
  );

  const inputBytes = new TextEncoder().encode(signingInput);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, inputBytes);
  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verify JWT signature
 */
export async function verifyJwtSignature(
  token: string,
  secret: string,
  alg: SupportedJwtAlg = 'HS256',
  secretIsBase64: boolean = false
): Promise<{ valid: boolean; error?: string }> {
  try {
    const trimmed = token.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token 必须包含三段由点分隔的内容' };
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    if (alg === 'none') {
      return { valid: signaturePart === '' };
    }

    if (!secret) {
      return { valid: false, error: '请输入秘钥以验证签名' };
    }

    const signingInput = `${headerPart}.${payloadPart}`;
    let secretBytes: Uint8Array;
    if (secretIsBase64) {
      try {
        secretBytes = base64UrlToBytes(secret);
      } catch {
        secretBytes = new TextEncoder().encode(secret);
      }
    } else {
      secretBytes = new TextEncoder().encode(secret);
    }

    const hashName = getHashName(alg);
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['sign']
    );

    const inputBytes = new TextEncoder().encode(signingInput);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, inputBytes);
    const expectedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));

    const valid = expectedSignature === signaturePart;
    return { valid, error: valid ? undefined : '计算出的签名与 Token 签名不匹配' };
  } catch (err: any) {
    return { valid: false, error: err.message || '验签计算异常' };
  }
}
