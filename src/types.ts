export type AppTab = 'json' | 'md5' | 'urlencode' | 'base64' | 'timestamp' | 'jwt';

export interface JSONParseError {
  message: string;
  line?: number;
  column?: number;
}

export interface TimestampResults {
  local: string;
  utc: string;
  sec: string;
  ms: string;
}
