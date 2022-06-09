import EventType from 'src/enums/mastercode/event-type.enum';

export class ChatEventResultDto {
  eventSeq: number;

  eventType: EventType;

  fromWho: number;

  toWho: number;

  chatSeq: number;

  createdAt: Date;

  expiredAt: Date;
}
