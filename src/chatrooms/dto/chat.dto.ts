import ChatType from 'src/enums/mastercode/chat-type.enum';

export default class ChatDto {
  chatSeq?: number;

  chatType: ChatType;

  chatName: string;

  password: string;

  isDirected: boolean;
}
