import { DiscordMessage, MolitItsEvent, TrafficInfo } from './types';

export const processTopisMessage = (info: TrafficInfo): DiscordMessage => {
  const codeToEmoji = {
    '01': '⚠️',
    '02': '📢',
  };
  const content = `${codeToEmoji[info.snsDataCd]} ${info.snsMsg}`;

  return {
    ...(info.snsImg && {
      attachment: info.snsImg,
      attachmentName: info.snsImgNm ?? 'image.png',
      attachmentType: 'base64',
    }),
    content: content,
  };
};

// TODO Link with NodeLink
export const processMolitItsMessage = (info: MolitItsEvent): DiscordMessage => {
  const content = `(${info.eventType}/${info.eventDetailType}) [${info.roadName}(${info.roadNo}))] [PLACEHOLDER FOR NODELINK] ${info.lanesBlocked}: ${info.message}\nDEBUG: eventType ${info.eventType} eventDetailType ${info.eventDetailType}`;
  return { content };
};
