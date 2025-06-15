import { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';
import { Env, TrafficInfo, TrafficInfoResponse } from './types.js';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    async function fetchLatestTrafficInfoList(): Promise<TrafficInfo[]> {
      const res = await fetch(env.API_URL);
      if (!res.ok) throw new Error('Failed to fetch from API');

      const json: TrafficInfoResponse = (await res.json()) as TrafficInfoResponse;
      const rows = json?.rows ?? [];

      if (!rows.length) return [];

      const history: string[] = JSON.parse((await env.KV.get('history')) ?? '[]');

      const newItems = rows.reverse().filter(item => !history.includes(item.createDate));

      return newItems;
    }

    async function sendToDiscord(trafficInfo: TrafficInfo) {
      const codeToEmoji = {
        '01': '🚧',
        '02': '📢',
      };
      const content = `${codeToEmoji[trafficInfo.snsDataCd]} ${trafficInfo.snsMsg}`;

      const res = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error(`Failed to send to Discord: ${res.status}`);
      }
    }

    async function insertHistory(date: string) {
      const history: string[] = JSON.parse((await env.KV.get('history')) ?? '[]');

      await env.KV.put('history', JSON.stringify([date].concat(history)));
    }

    const list = await fetchLatestTrafficInfoList();

    for (const info of list) {
      console.log(info.snsMsg);

      await sendToDiscord(info);

      await insertHistory(info.createDate);
    }
  },
};
