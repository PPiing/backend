export default interface ISocketSend {
  rooms?: number[]; // 채팅방 번호 배열
  chatSeq?: number; // 채팅룸 ID
  userIDs?: number[]; // 동작을 수행할 대상의 userIDs 배열
  msg?: string; // 메시지
  id?: number; // 메시지일 경우 고유 ID
  kicked?: boolean; // 방에서 자진해서 나간건지 강퇴당했는지 여부
  role?: PartcAuth; // 유저의 권한이 변경될 때 권한을 나타냄
}
