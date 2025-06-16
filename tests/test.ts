import { MolitItsEvent, MolitItsJSON } from './../src/types';

// 국토교통부(MoLIT) ITS Test
const molitItsUrl = `https://openapi.its.go.kr:9443/eventInfo?apiKey=${process.env.MOLIT_API_KEY}&type=all&eventType=all&getType=json`;
// type: 도로 유형(all: 전체 / ex: 고속도로 / its: 국도)
// eventType: 이벤트 유형(all: 전체 / cor: 공사 / acc: 교통사고 / wea: 기상 / ete: 기타돌발 / dis: 재난 / etc: 기타)
// minX: 최소 경도: 영역 도로 유형(all) 혹은 도로 방향(all)의 경우 사용 가능
// maxX: 최대 경도: 영역 도로 유형(all) 혹은 도로 방향(all)의 경우 사용 가능
// minY: 최소 위도: 영역 도로 유형 (all)의 경우 사용 가능
// maxY: 최대 위도: 영역 도로 유형(all)의 경우 사용 가능

const fetchLatestMolitItsInfo = async (): Promise<MolitItsEvent[]> => {
  const res = await fetch(molitItsUrl);
  if (!res.ok)
    throw new Error('Failed fetching from MoLIT(국토교통부) its.go.kr');
  const json: MolitItsJSON = (await res.json()) as MolitItsJSON;
  const rows = json?.body?.totalCount ? json.body.items : [];
  const historyMolit: string[] = JSON.parse(
    (await env.KV.get('historyMolit')) ?? '[]'
  );
  const newItems = rows
    .reverse()
    .filter((item) => !historyMolit.includes(item.startDate));

  return newItems;
};
