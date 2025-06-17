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

export interface MolitItsJSON {
  header: MolitItsJSONHeader;
  body: MolitItsJSONBody;
}

export interface MolitItsJSONHeader {
  resultCode: 0 | 1; // 응답 코드 (0: 성공 / 1: 실패)
  resultMsg: string | null;
}

export interface MolitItsJSONBody {
  totalCount: number;
  items: MolitItsEvent[];
}

export interface MolitItsEvent {
  type: string; // 도로 유형(고속도로 / 국도 / 지방도 / 시군도 / 기타)
  eventType: string; // 이벤트유형(교통사고 / 공사 / 기상 / 재난 / 기타돌발 / 기타)
  eventDetailType: string; // 이벤트세부유형
  startDate: string; // 발생 일시(YYYYMMDDHH24MISS)
  coordX: string; // 경도
  coordY: string; // 위도
  linkId: string; // 링크 ID ("3190009500")
  roadName: string; // 도로명 ("서해안선")
  roadNo: string; // 도로번호 ("15")
  roadDrcType: string; // 도로 방향 유형 ("종점")
  lanesBlockType: string; // 차단 통제 유형 ("") or empty string
  lanesBlocked: string; // 차단 차로 ("2차로 차단") or empty string
  message: string; // 돌발 내용 ("(2차로)이동노면보수작업중")
  endDate: string; // 종료 일시(YYYYMMDDHH24MISS) or empty string
}

export interface DiscordMessage {
  attachment?: string;
  attachmentName?: string;
  attachmentType?: 'base64' | 'url';
  content: string;
}
