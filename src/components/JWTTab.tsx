import React, { useState, useEffect, useMemo } from 'react';
import {
  decodeJwtToken,
  signJwt,
  verifyJwtSignature,
  DecodedJWT,
  SupportedJwtAlg,
} from '../utils/jwt';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  FileCode,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_HEADER = {
  alg: 'HS256',
  typ: 'JWT',
};

const SAMPLE_PAYLOAD = {
  sub: 'user_1024',
  name: 'Alex Developer',
  admin: true,
  iss: 'https://auth.devtool.internal',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
};

const SAMPLE_SECRET = 'your-256-bit-secret-key-phrase';

// Pre-built sample JWT generated with HS256 and SAMPLE_SECRET
const DEFAULT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEwMjQiLCJuYW1lIjoiQWxleCBEZXZlbG9wZXIiLCJhZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmRldnRvb2wuaW50ZXJuYWwiLCJpYXQiOjE3NTAwMDAwMDAsImV4cCI6MTc1MDAwNzIwMH0.Vv3L4_8mXlJq-7rQ19gN_x3XJ-o_U_w77h8_sample_sig';

export function JWTTab() {
  const { t, lang } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'decode' | 'encode'>('decode');

  // ===================== DECODER STATE =====================
  const [tokenInput, setTokenInput] = useState<string>(DEFAULT_TOKEN);
  const [verifySecret, setVerifySecret] = useState<string>(SAMPLE_SECRET);
  const [showVerifySecret, setShowVerifySecret] = useState<boolean>(false);
  const [verifySecretBase64, setVerifySecretBase64] = useState<boolean>(false);
  const [verifyAlg, setVerifyAlg] = useState<SupportedJwtAlg>('HS256');
  const [verifyResult, setVerifyResult] = useState<{
    status: 'idle' | 'verified' | 'failed' | 'empty_secret';
    message: string;
  }>({ status: 'idle', message: lang === 'zh' ? '输入密钥后自动验签' : 'Auto-verifies once secret is entered' });

  // ===================== ENCODER STATE =====================
  const [encodeHeaderStr, setEncodeHeaderStr] = useState<string>(
    JSON.stringify(DEFAULT_HEADER, null, 2)
  );
  const [encodePayloadStr, setEncodePayloadStr] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOAD, null, 2)
  );
  const [encodeSecret, setEncodeSecret] = useState<string>(SAMPLE_SECRET);
  const [showEncodeSecret, setShowEncodeSecret] = useState<boolean>(false);
  const [encodeSecretBase64, setEncodeSecretBase64] = useState<boolean>(false);
  const [encodeAlg, setEncodeAlg] = useState<SupportedJwtAlg>('HS256');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [encodeError, setEncodeError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  // ===================== DECODE COMPUTATION =====================
  const decodedData: { jwt: DecodedJWT | null; error: string | null } = useMemo(() => {
    if (!tokenInput.trim()) {
      return { jwt: null, error: null };
    }
    try {
      const parsed = decodeJwtToken(tokenInput.trim());
      return { jwt: parsed, error: null };
    } catch (err: any) {
      return { jwt: null, error: err.message || (lang === 'zh' ? 'Token 格式无法解析' : 'Unable to parse token format') };
    }
  }, [tokenInput, lang]);

  // Auto-sync verify algorithm if detected from decoded header
  useEffect(() => {
    if (decodedData.jwt?.header?.alg) {
      const alg = decodedData.jwt.header.alg;
      if (['HS256', 'HS384', 'HS512', 'none'].includes(alg)) {
        setVerifyAlg(alg as SupportedJwtAlg);
      }
    }
  }, [decodedData.jwt]);

  // Run signature verification on decoder changes
  useEffect(() => {
    let isMounted = true;
    async function checkSignature() {
      if (!tokenInput.trim() || !decodedData.jwt) {
        setVerifyResult({
          status: 'idle',
          message: lang === 'zh' ? '等待输入有效 Token' : 'Waiting for valid token'
        });
        return;
      }

      if (verifyAlg === 'none') {
        if (!decodedData.jwt.signatureRaw) {
          setVerifyResult({
            status: 'verified',
            message: lang === 'zh' ? '算法为 none，无签名通过' : 'Algorithm none: unverified signature accepted'
          });
        } else {
          setVerifyResult({
            status: 'failed',
            message: lang === 'zh' ? '算法为 none 但 Token 包含签名数据' : 'Algorithm is none but token contains signature bytes'
          });
        }
        return;
      }

      if (!verifySecret) {
        setVerifyResult({
          status: 'empty_secret',
          message: lang === 'zh' ? '请输入秘钥以验证签名' : 'Enter secret key to verify signature'
        });
        return;
      }

      try {
        const res = await verifyJwtSignature(
          tokenInput.trim(),
          verifySecret,
          verifyAlg,
          verifySecretBase64
        );
        if (!isMounted) return;
        if (res.valid) {
          setVerifyResult({
            status: 'verified',
            message: lang === 'zh' ? '签名验证有效 (Signature Verified)' : 'Signature Verified'
          });
        } else {
          setVerifyResult({
            status: 'failed',
            message: res.error || (lang === 'zh' ? '签名验证失败，与密钥不匹配' : 'Signature verification failed (mismatched key)')
          });
        }
      } catch (err: any) {
        if (!isMounted) return;
        setVerifyResult({
          status: 'failed',
          message: err.message || (lang === 'zh' ? '验签过程异常' : 'Verification exception')
        });
      }
    }

    checkSignature();
    return () => {
      isMounted = false;
    };
  }, [tokenInput, verifySecret, verifyAlg, verifySecretBase64, decodedData.jwt, lang]);

  // ===================== ENCODE COMPUTATION =====================
  useEffect(() => {
    let isMounted = true;
    async function produceToken() {
      setEncodeError(null);
      try {
        let headerObj: any;
        let payloadObj: any;

        try {
          headerObj = JSON.parse(encodeHeaderStr);
        } catch {
          throw new Error(lang === 'zh' ? 'Header 不是有效的 JSON 格式' : 'Header is not valid JSON format');
        }

        try {
          payloadObj = JSON.parse(encodePayloadStr);
        } catch {
          throw new Error(lang === 'zh' ? 'Payload 不是有效的 JSON 格式' : 'Payload is not valid JSON format');
        }

        // Keep alg in header in sync with chosen encodeAlg
        headerObj.alg = encodeAlg;

        const token = await signJwt(
          headerObj,
          payloadObj,
          encodeSecret,
          encodeAlg,
          encodeSecretBase64
        );
        if (!isMounted) return;
        setGeneratedToken(token);
      } catch (err: any) {
        if (!isMounted) return;
        setEncodeError(err.message || (lang === 'zh' ? '生成失败' : 'Generation failed'));
        setGeneratedToken('');
      }
    }

    produceToken();
    return () => {
      isMounted = false;
    };
  }, [encodeHeaderStr, encodePayloadStr, encodeSecret, encodeAlg, encodeSecretBase64, lang]);

  // Helper: load sample token into decoder
  const loadSampleToken = (type: 'valid' | 'expired') => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user_8888',
      name: 'Li Bai',
      role: 'developer',
      iat: type === 'valid' ? now : now - 7200,
      exp: type === 'valid' ? now + 3600 : now - 3600,
    };

    signJwt(DEFAULT_HEADER, payload, SAMPLE_SECRET, 'HS256').then((t) => {
      setTokenInput(t);
      setVerifySecret(SAMPLE_SECRET);
      setVerifyAlg('HS256');
    });
  };

  // Helper: load decoded token into generator for fast editing
  const loadDecodedToGenerator = () => {
    if (!decodedData.jwt) return;
    setEncodeHeaderStr(JSON.stringify(decodedData.jwt.header, null, 2));
    setEncodePayloadStr(JSON.stringify(decodedData.jwt.payload, null, 2));
    if (decodedData.jwt.header?.alg) {
      setEncodeAlg(decodedData.jwt.header.alg as SupportedJwtAlg);
    }
    setEncodeSecret(verifySecret);
    setActiveSubTab('encode');
  };

  // Helper: load generated token into decoder
  const loadGeneratedToDecoder = () => {
    if (!generatedToken) return;
    setTokenInput(generatedToken);
    setVerifySecret(encodeSecret);
    setVerifyAlg(encodeAlg);
    setActiveSubTab('decode');
  };

  // Helper: update payload claims in generator
  const modifyPayloadExp = (hoursToAdd: number | null) => {
    try {
      const parsed = JSON.parse(encodePayloadStr);
      const now = Math.floor(Date.now() / 1000);
      parsed.iat = now;
      if (hoursToAdd === null) {
        delete parsed.exp;
      } else {
        parsed.exp = now + hoursToAdd * 3600;
      }
      setEncodePayloadStr(JSON.stringify(parsed, null, 2));
    } catch {
      // payload not JSON
    }
  };

  // Helper: generate random secret
  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let res = '';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    for (let i = 0; i < 32; i++) {
      res += chars[array[i] % chars.length];
    }
    setEncodeSecret(res);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab switcher: Decode vs Encode */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('decode')}
            id="jwt-subtab-decode-btn"
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'decode'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound size={15} />
            <span>{t('jwt_tab_decode')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('encode')}
            id="jwt-subtab-encode-btn"
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'encode'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={15} />
            <span>{t('jwt_tab_encode')}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Lock size={13} className="text-emerald-500" />
          <span>{lang === 'zh' ? '支持 Web Crypto 本地 HS256 / HS384 / HS512 高性能验签与签名' : 'High performance local Web Crypto HS256 / HS384 / HS512 signature'}</span>
        </div>
      </div>

      {/* ======================= VIEW 1: DECODE ======================= */}
      {activeSubTab === 'decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (5 cols): Token input + visual breakdown */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-1.5">
                  <KeyRound size={16} className="text-sky-600 dark:text-sky-400" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {t('jwt_token_label')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(tokenInput, 'token')}
                    id="jwt-copy-token-btn"
                    type="button"
                    disabled={!tokenInput}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'token' ? t('copied') : t('copy')}</span>
                  </button>
                  <button
                    onClick={() => setTokenInput('')}
                    id="jwt-clear-token-btn"
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>{t('clear')}</span>
                  </button>
                </div>
              </div>

              {/* Raw Textarea */}
              <div className="relative">
                <textarea
                  id="jwt-token-input-textarea"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={t('jwt_token_placeholder')}
                  className="w-full h-56 p-3.5 bg-[#15191f] dark:bg-[#0f1318] text-slate-100 font-mono text-xs sm:text-sm leading-relaxed border-0 outline-none resize-none break-all"
                />
              </div>

              {/* Token quick samples */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50/70 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{lang === 'zh' ? '快捷示例载入：' : 'Load Samples:'}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadSampleToken('valid')}
                    id="jwt-sample-valid-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium cursor-pointer transition-all"
                  >
                    {lang === 'zh' ? '有效 Token' : 'Active Token'}
                  </button>
                  <button
                    onClick={() => loadSampleToken('expired')}
                    id="jwt-sample-expired-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium cursor-pointer transition-all"
                  >
                    {lang === 'zh' ? '已过期 Token' : 'Expired Token'}
                  </button>
                </div>
              </div>

              {/* Visual segment breakdown highlight */}
              {decodedData.jwt && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    {lang === 'zh' ? '三段式结构色彩对应：' : '3-Part Color Breakdown:'}
                  </div>
                  <div className="flex flex-col gap-1.5 font-mono text-xs break-all bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                    <div className="text-rose-500 dark:text-rose-400">
                      <strong className="text-slate-400 font-sans mr-1">Header:</strong>
                      {decodedData.jwt.raw.split('.')[0]}
                    </div>
                    <div className="text-purple-600 dark:text-purple-400">
                      <strong className="text-slate-400 font-sans mr-1">Payload:</strong>
                      {decodedData.jwt.raw.split('.')[1]}
                    </div>
                    {decodedData.jwt.signatureRaw && (
                      <div className="text-sky-600 dark:text-sky-400">
                        <strong className="text-slate-400 font-sans mr-1">Signature:</strong>
                        {decodedData.jwt.signatureRaw}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error snippet if token is malformed */}
              {decodedData.error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{decodedData.error}</span>
                </div>
              )}
            </div>

            {/* Signature Verification Box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-sm">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t('jwt_verify_title')}</span>
                </div>
                <select
                  id="jwt-verify-alg-select"
                  value={verifyAlg}
                  onChange={(e) => setVerifyAlg(e.target.value as SupportedJwtAlg)}
                  className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg outline-none cursor-pointer"
                >
                  <option value="HS256">HS256 (SHA-256)</option>
                  <option value="HS384">HS384 (SHA-384)</option>
                  <option value="HS512">HS512 (SHA-512)</option>
                  <option value="none">none ({lang === 'zh' ? '无签名' : 'No Signature'})</option>
                </select>
              </div>

              {verifyAlg !== 'none' && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="jwt-verify-secret-input"
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between"
                  >
                    <span>{t('jwt_verify_secret_label')}：</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-normal cursor-pointer text-slate-500 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={verifySecretBase64}
                        onChange={(e) => setVerifySecretBase64(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-sky-600"
                      />
                      {t('jwt_secret_base64_checkbox')}
                    </label>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="jwt-verify-secret-input"
                      type={showVerifySecret ? 'text' : 'password'}
                      value={verifySecret}
                      onChange={(e) => setVerifySecret(e.target.value)}
                      placeholder={lang === 'zh' ? '输入生成该 Token 时使用的秘钥…' : 'Enter signing secret key...'}
                      className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 dark:focus:border-sky-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 pr-9 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-lg outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowVerifySecret(!showVerifySecret)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showVerifySecret ? (lang === 'zh' ? '隐藏秘钥' : 'Hide secret') : (lang === 'zh' ? '显示秘钥' : 'Show secret')}
                    >
                      {showVerifySecret ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div
                className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                  verifyResult.status === 'verified'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : verifyResult.status === 'failed'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      : verifyResult.status === 'empty_secret'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {verifyResult.status === 'verified' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : verifyResult.status === 'failed' ? (
                  <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                ) : (
                  <KeyRound size={16} className="text-slate-400 shrink-0" />
                )}
                <span className="font-semibold">{verifyResult.message}</span>
              </div>
            </div>

            {/* Send to generator button */}
            {decodedData.jwt && (
              <button
                onClick={loadDecodedToGenerator}
                id="jwt-send-to-generator-btn"
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span>{t('jwt_to_encoder_btn')}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Right Column (7 cols): Decoded Header, Payload & Claim Analysis */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Claims Highlight Dashboard */}
            {decodedData.jwt && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Clock size={15} className="text-sky-600 dark:text-sky-400" />
                  <span>{t('jwt_claims_overview')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* iat */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono font-bold text-indigo-900 dark:text-indigo-400">
                        {t('jwt_issued_at')}
                      </span>
                      <span>{decodedData.jwt.claimsInfo.iat?.value ?? t('jwt_not_set')}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {decodedData.jwt.claimsInfo.iat?.formatted ?? '—'}
                    </div>
                  </div>

                  {/* exp */}
                  <div
                    className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                      decodedData.jwt.claimsInfo.exp
                        ? decodedData.jwt.claimsInfo.exp.isExpired
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono font-bold text-indigo-900 dark:text-indigo-400">
                        {t('jwt_expiration')}
                      </span>
                      <span>{decodedData.jwt.claimsInfo.exp?.value ?? t('jwt_not_set')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {decodedData.jwt.claimsInfo.exp?.formatted ?? (lang === 'zh' ? '无过期限制' : 'No expiration limit')}
                      </div>
                      {decodedData.jwt.claimsInfo.exp && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            decodedData.jwt.claimsInfo.exp.isExpired
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200'
                          }`}
                        >
                          {decodedData.jwt.claimsInfo.exp.isExpired ? t('jwt_status_expired') : t('jwt_status_active')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* sub & iss */}
                  {(decodedData.jwt.claimsInfo.sub || decodedData.jwt.claimsInfo.iss) && (
                    <div className="sm:col-span-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
                      {decodedData.jwt.claimsInfo.sub && (
                        <div>
                          <span className="text-slate-400 mr-1">{t('jwt_subject')}:</span>
                          <strong className="font-mono text-slate-800 dark:text-slate-200">
                            {decodedData.jwt.claimsInfo.sub}
                          </strong>
                        </div>
                      )}
                      {decodedData.jwt.claimsInfo.iss && (
                        <div>
                          <span className="text-slate-400 mr-1">{t('jwt_issuer')}:</span>
                          <strong className="font-mono text-slate-800 dark:text-slate-200">
                            {decodedData.jwt.claimsInfo.iss}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Decoded Header Section */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {t('jwt_header_title')}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(decodedData.jwt?.headerPretty || '', 'header')
                  }
                  id="jwt-copy-header-btn"
                  type="button"
                  disabled={!decodedData.jwt}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  <Copy size={12} />
                  <span>{copiedKey === 'header' ? t('copied') : t('copy')}</span>
                </button>
              </div>
              <div className="p-3 bg-[#15191f] dark:bg-[#0f1318] text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto min-h-[90px]">
                {decodedData.jwt ? (
                  <pre className="text-rose-400 dark:text-rose-300 m-0">
                    {decodedData.jwt.headerPretty}
                  </pre>
                ) : (
                  <span className="text-slate-500">{lang === 'zh' ? '等待输入有效 JWT…' : 'Waiting for valid JWT...'}</span>
                )}
              </div>
            </div>

            {/* Decoded Payload Section */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {t('jwt_payload_title')}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(decodedData.jwt?.payloadPretty || '', 'payload')
                  }
                  id="jwt-copy-payload-btn"
                  type="button"
                  disabled={!decodedData.jwt}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  <Copy size={12} />
                  <span>{copiedKey === 'payload' ? t('copied') : t('copy')}</span>
                </button>
              </div>
              <div className="p-3.5 bg-[#15191f] dark:bg-[#0f1318] text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto min-h-[160px] max-h-[360px] overflow-y-auto">
                {decodedData.jwt ? (
                  <pre className="text-purple-400 dark:text-purple-300 m-0">
                    {decodedData.jwt.payloadPretty}
                  </pre>
                ) : (
                  <span className="text-slate-500">{lang === 'zh' ? '等待输入有效 JWT…' : 'Waiting for valid JWT...'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= VIEW 2: ENCODE / SIGN ======================= */}
      {activeSubTab === 'encode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Header, Payload, Secret & Options */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Header JSON Box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {t('jwt_edit_header_label')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('jwt_sign_algorithm_label')}：
                  </span>
                  <select
                    id="jwt-encode-alg-select"
                    value={encodeAlg}
                    onChange={(e) => setEncodeAlg(e.target.value as SupportedJwtAlg)}
                    className="text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="HS384">HS384 (HMAC SHA-384)</option>
                    <option value="HS512">HS512 (HMAC SHA-512)</option>
                    <option value="none">none ({lang === 'zh' ? '无签名' : 'No Signature'})</option>
                  </select>
                </div>
              </div>
              <textarea
                id="jwt-encode-header-textarea"
                value={encodeHeaderStr}
                onChange={(e) => setEncodeHeaderStr(e.target.value)}
                rows={4}
                className="w-full p-3 bg-[#15191f] dark:bg-[#0f1318] text-rose-400 dark:text-rose-300 font-mono text-xs sm:text-sm leading-relaxed border-0 outline-none resize-none"
              />
            </div>

            {/* Payload JSON Box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {t('jwt_edit_payload_label')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => modifyPayloadExp(1)}
                    id="jwt-payload-add-1h-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium text-xs cursor-pointer"
                  >
                    {t('jwt_time_plus_1h')}
                  </button>
                  <button
                    onClick={() => modifyPayloadExp(24)}
                    id="jwt-payload-add-24h-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium text-xs cursor-pointer"
                  >
                    {t('jwt_time_plus_24h')}
                  </button>
                  <button
                    onClick={() => modifyPayloadExp(24 * 7)}
                    id="jwt-payload-add-7d-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium text-xs cursor-pointer"
                  >
                    {t('jwt_time_plus_7d')}
                  </button>
                  <button
                    onClick={() => modifyPayloadExp(null)}
                    id="jwt-payload-no-exp-btn"
                    type="button"
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium text-xs cursor-pointer"
                  >
                    {t('jwt_time_remove_exp')}
                  </button>
                </div>
              </div>
              <textarea
                id="jwt-encode-payload-textarea"
                value={encodePayloadStr}
                onChange={(e) => setEncodePayloadStr(e.target.value)}
                rows={9}
                className="w-full p-3 bg-[#15191f] dark:bg-[#0f1318] text-purple-400 dark:text-purple-300 font-mono text-xs sm:text-sm leading-relaxed border-0 outline-none resize-none"
              />
            </div>

            {/* Secret key configuration */}
            {encodeAlg !== 'none' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label
                    htmlFor="jwt-encode-secret-input"
                    className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5"
                  >
                    <KeyRound size={15} className="text-amber-500" />
                    <span>{t('jwt_sign_secret_label')}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={generateRandomSecret}
                      id="jwt-generate-random-secret-btn"
                      type="button"
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
                    >
                      {t('jwt_gen_secret_btn')}
                    </button>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={encodeSecretBase64}
                        onChange={(e) => setEncodeSecretBase64(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-sky-600"
                      />
                      {t('jwt_secret_base64_checkbox')}
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="jwt-encode-secret-input"
                    type={showEncodeSecret ? 'text' : 'password'}
                    value={encodeSecret}
                    onChange={(e) => setEncodeSecret(e.target.value)}
                    placeholder={lang === 'zh' ? '输入签名密钥…' : 'Enter signing secret key...'}
                    className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 dark:focus:border-sky-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 pr-9 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-lg outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEncodeSecret(!showEncodeSecret)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showEncodeSecret ? (lang === 'zh' ? '隐藏秘钥' : 'Hide secret') : (lang === 'zh' ? '显示秘钥' : 'Show secret')}
                  >
                    {showEncodeSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Generated Token Result & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-sm">
                  <FileCode size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t('jwt_generated_token_label')}</span>
                </div>
                <button
                  onClick={() => handleCopyText(generatedToken, 'genToken')}
                  id="jwt-copy-generated-token-btn"
                  type="button"
                  disabled={!generatedToken}
                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                >
                  <Copy size={13} />
                  <span>{copiedKey === 'genToken' ? t('copied') : t('copy')}</span>
                </button>
              </div>

              {/* Output textarea */}
              <div className="p-3 bg-[#15191f] dark:bg-[#0f1318]">
                <textarea
                  id="jwt-generated-token-textarea"
                  readOnly
                  value={generatedToken}
                  placeholder={lang === 'zh' ? '等待生成…' : 'Waiting for token generation...'}
                  className="w-full h-64 bg-transparent text-emerald-400 dark:text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed border-0 outline-none resize-none break-all"
                />
              </div>

              {/* Error message if generation failed */}
              {encodeError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{encodeError}</span>
                </div>
              )}

              {/* Generation status and token stats */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>{lang === 'zh' ? '实时签名已就绪' : 'Signature ready'}</span>
                </span>
                <span className="font-mono">
                  {generatedToken ? `${generatedToken.length} ${lang === 'zh' ? '字符' : 'chars'}` : `0 ${lang === 'zh' ? '字符' : 'chars'}`}
                </span>
              </div>
            </div>

            {/* Jump to decoder button */}
            {generatedToken && (
              <button
                onClick={loadGeneratedToDecoder}
                id="jwt-load-to-decoder-btn"
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span>{t('jwt_to_decoder_btn')}</span>
                <ArrowRight size={14} />
              </button>
            )}

            {/* Knowledge tips box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                💡 {lang === 'zh' ? 'JWT 格式规范说明：' : 'JWT Specification Notes:'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-rose-500">Header</strong> {lang === 'zh' ? '包含令牌类型与加密签名算法。' : 'contains token type and cryptographic algorithm.'}
                </li>
                <li>
                  <strong className="text-purple-500">Payload</strong> {lang === 'zh' ? '包含实际存载的 Claims（如 exp 过期时间、sub 用户ID）。' : 'contains the claims (e.g. expiration, subject).'}
                </li>
                <li>
                  <strong className="text-sky-500">Signature</strong>{' '}
                  {lang === 'zh' ? '由标头、载荷与私钥通过指定算法计算得出，防止篡改。' : 'is computed with header, payload, and secret to prevent tampering.'}
                </li>
                <li>{lang === 'zh' ? '所有计算在浏览器内通过原生 Web Crypto API 完成，秘钥绝不离机。' : 'All cryptographic signing and verification run locally via Web Crypto API.'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
