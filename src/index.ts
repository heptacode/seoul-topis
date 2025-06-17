import { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';
import {
  AttachmentBuilder,
  BaseMessageOptions,
  WebhookClient,
} from 'discord.js';
import { processMolitItsMessage, processTopisMessage } from './messages';
import {
  DiscordMessage,
  Env,
  MolitItsEvent,
  MolitItsJSON,
  TrafficInfo,
  TrafficInfoResponse,
} from './types';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    async function fetchLatestTopisInfo(): Promise<TrafficInfo[]> {
      const res = await fetch(env.API_URL);
      if (!res.ok) throw new Error('Failed fetching from Seoul TOPIS');

      const json: TrafficInfoResponse =
        (await res.json()) as TrafficInfoResponse;
      const rows = json?.rows ?? [];

      if (!rows.length) return [];

      const history: string[] = JSON.parse(
        (await env.KV.get('history')) ?? '[]'
      );

      const newItems = rows
        .reverse()
        .filter((item) => !history.includes(item.createDate));

      return newItems;
    }

    async function fetchLatestMolitItsInfo(): Promise<MolitItsEvent[]> {
      const molitItsUrl = `https://openapi.its.go.kr:9443/eventInfo?apiKey=${env.MOLIT_API_KEY}&type=all&eventType=all&getType=json`;
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
    }

    async function sendToDiscord(message: DiscordMessage) {
      const webhookClient = new WebhookClient({ url: env.DISCORD_WEBHOOK_URL });
      let files: BaseMessageOptions['files'] = [];

      if (message.attachment && message.attachmentType === 'base64') {
        const buffer = Buffer.from(message.attachment, 'base64');
        const attachment = new AttachmentBuilder(buffer, {
          name: message.attachmentName,
        });
        files = [attachment];
      }

      await webhookClient.send({
        content: message.content,
        files: files,
      });
    }

    async function insertHistory(_key: string, date: string) {
      const history: string[] = JSON.parse((await env.KV.get(_key)) ?? '[]');

      await env.KV.put(_key, JSON.stringify([date].concat(history)));
    }

    const topisInfoList = await fetchLatestTopisInfo();

    for (const topisInfo of topisInfoList) {
      console.log(topisInfo.snsMsg);
      await sendToDiscord(processTopisMessage(topisInfo));
      await insertHistory('history', topisInfo.createDate);
    }

    const molitInfoList = await fetchLatestMolitItsInfo();

    for (const molitInfo of molitInfoList) {
      console.log(molitInfo.message);
      //ignore "\"빗길\"주의", "\"노면습기\"주의", etc.
      if (
        molitInfo.eventDetailType === '강우' ||
        molitInfo.eventDetailType === '노면습기' ||
        molitInfo.eventDetailType === '이벤트/홍보'
      )
        continue;
      await sendToDiscord(processMolitItsMessage(molitInfo));
      await insertHistory('historyMolit', molitInfo.startDate);
    }
  },
};
