import { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';
import { AttachmentBuilder, BaseMessageOptions, WebhookClient } from 'discord.js';
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

    async function sendToDiscord(info: TrafficInfo) {
      const webhookClient = new WebhookClient({ url: env.DISCORD_WEBHOOK_URL });
      let files: BaseMessageOptions['files'] = [];

      if (info.snsImg) {
        const buffer = Buffer.from(info.snsImg, 'base64');
        const attachment = new AttachmentBuilder(buffer, {
          name: info.snsImgNm ?? `image.png`,
        });
        files = [attachment];
      }

      const codeToEmoji = {
        '01': '⚠️',
        '02': '📢',
      };
      const content = `${codeToEmoji[info.snsDataCd]} ${info.snsMsg}`;

      await webhookClient.send({
        content,
        files,
      });
    }

    async function insertHistory(date: string) {
      const history: string[] = JSON.parse((await env.KV.get('history')) ?? '[]');

      await env.KV.put('history', JSON.stringify([date].concat(history)));
    }

    const infoList = await fetchLatestTrafficInfoList();

    for (const info of infoList) {
      console.log(info.snsMsg);

      await sendToDiscord(info);

      await insertHistory(info.createDate);
    }
  },
};
