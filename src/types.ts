import { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  API_URL: string;
  DISCORD_WEBHOOK_URL: string;
  KV: KVNamespace;
}

export interface TrafficInfo {
  stndDt: string; // "2025-06-15"
  snsDataNm: '돌발' | '소통';
  snsDataCd: '01' | '02';
  snsId: number; // 1030135
  snsImg: string | null; // (image/png;base64) | null
  snsImgNm: string | null; // "K-001.jpg" | null
  snsImgSize: string; // "222,925" | "0"
  snsMsg: string; // "[12:00]  남부순환로 1차로 시설물보수 진행 중입니다.\r\nhttps://topis.seoul.go.kr/?accId=1030135"
  createDate: string; // "2025-06-15 13:37:20"
}

export interface TrafficInfoResponse {
  rows: TrafficInfo[];
}
