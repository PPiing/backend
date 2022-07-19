export default interface ISocketSend {
  senderSeq?: number; // 송신자 ID
  alarmCode: AlarmCode; // 알람 코드
  message?: string; // 알람 메시지
}
