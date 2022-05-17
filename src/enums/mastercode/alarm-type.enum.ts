/**
 * 알람의 타입을 정의하는 열거형
 *
 * @author joohongpark
 */
enum AlarmType {
  ALTP10 = 'ALTP10', // 일반 알람 (종모양)
  ALTP20 = 'ALTP20', // 컨펌 알람 (모달)
  ALTP30 = 'ALTP30', // 그 외 알람
}
export default AlarmType;
