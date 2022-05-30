/**
 * 채팅 참가자의 권한을 정의하는 열거형
 *
 * @author joohongpark
 */
enum PartcAuth {
  CPAU10 = 'CPAU10', // 일반 유저
  CPAU20 = 'CPAU20', // 관리자
  CPAU30 = 'CPAU30', // 소유자
}

export default PartcAuth;
