# Seoul TOPIS Discord Bot

A Cloudflare Workers cron job that monitors Seoul Traffic Operations and Information Service (TOPIS) and sends real-time traffic alerts to Discord.

## Features

- 🚦 **Real-time Traffic Updates**: Automatically fetches the latest traffic information from Seoul TOPIS
- 📢 **Discord Notifications**: Sends formatted alerts with emojis to Discord via webhooks
- 🖼️ **Image Support**: Includes traffic situation images when available
- 💾 **Smart Filtering**: Uses Cloudflare KV to track notification history and prevent duplicates
- ⏰ **Scheduled Execution**: Runs on a cron schedule to continuously monitor traffic updates

## Traffic Alert Types

- ⚠️ **Incident Alerts** (`snsDataCd: 01`): Accidents, road closures, and other unexpected events
- 📢 **Traffic Updates** (`snsDataCd: 02`): General traffic flow information

## Prerequisites

- [Cloudflare Workers](https://workers.cloudflare.com/) account
- [Discord Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/heptacode/seoul-topis.git
   cd seoul-topis
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create a KV namespace**
   ```bash
   wrangler kv:namespace create KV
   ```
   Update the `kv_namespaces` section in `wrangler.jsonc` with the generated namespace ID.

4. **Set up secrets**
   ```bash
   wrangler secret put DISCORD_WEBHOOK_URL
   ```
   Enter your Discord webhook URL when prompted.

5. **Configure cron trigger**
   Add a cron trigger to your `wrangler.jsonc`:
   ```jsonc
   {
     "triggers": {
       "crons": ["*/5 * * * *"]  // Runs every 5 minutes
     }
   }
   ```

6. **Deploy**
   ```bash
   wrangler deploy
   ```

## Configuration

The worker uses the following environment variables:

- `API_URL`: Seoul TOPIS API endpoint (default: `https://topis.seoul.go.kr/main/selectTwitterInfo.do`)
- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL (secret)
- `KV`: Cloudflare KV namespace for storing notification history

## How It Works

1. **Fetch Traffic Data**: The worker calls the Seoul TOPIS API on a scheduled basis
2. **Check History**: Compares new alerts against stored history in Cloudflare KV
3. **Filter New Items**: Only processes traffic updates that haven't been sent before
4. **Send to Discord**: Posts formatted messages with images (if available) to Discord
5. **Update History**: Stores the creation date of sent alerts to prevent duplicates

## Development

Build the TypeScript project:
```bash
pnpm build
```

Run locally with Wrangler:
```bash
wrangler dev
```

Test the scheduled event:
```bash
wrangler dev --test-scheduled
```

## Project Structure

```
seoul-topis/
├── src/
│   ├── index.ts      # Main worker logic
│   └── types.ts      # TypeScript type definitions
├── wrangler.jsonc    # Cloudflare Workers configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## API Response Format

The TOPIS API returns traffic information in the following format:

```typescript
{
  stndDt: string;        // Date (YYYY-MM-DD)
  snsDataNm: string;     // Type name ("돌발" | "소통")
  snsDataCd: string;     // Type code ("01" | "02")
  snsId: number;         // Unique identifier
  snsImg: string | null; // Base64 encoded image
  snsImgNm: string | null;   // Image filename
  snsMsg: string;        // Alert message
  createDate: string;    // Creation timestamp
}
```