/**
 * 채팅방 이벤트의 타입을 정하는 열거형
 *
 * @author joohongpark
 */
enum EventType {
  EVST10 = 'EVST10', // 킥
  EVST20 = 'EVST20', // 밴
  EVST30 = 'EVST30', // 뮤트
  EVST40 = 'EVST40', // 들어오는 경우
  EVST45 = 'EVST45', // 나가는 경우
}
export default EventType;
