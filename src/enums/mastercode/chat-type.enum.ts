/**
 * 채팅방의 타입을 정의하는 열거형
 *
 * @author joohongpark
 */
enum ChatType {
  CHTP10 = 'CHTP10', // 개인 채팅방 (DM)
  CHTP20 = 'CHTP20', // 단체 채팅방 (public)
  CHTP30 = 'CHTP30', // 단체 채팅방 (protected)
  CHTP40 = 'CHTP40', // 비밀 채팅방 (private)
}
export default ChatType;
