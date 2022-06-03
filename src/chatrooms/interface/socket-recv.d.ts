export default interface ISocketRecv {
  content: string; // 메시지
  at: number; // 메시지를 보내고자 하는 룸 ID
}
