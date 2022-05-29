export class MessageDataDto {
  msgSeq: number;

  chatSeq: number;

  partcSeq: number | string; // 추후에 number로 변경

  msg: string;

  createAt: Date;
}
