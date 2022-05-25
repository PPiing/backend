/**
 * 게임 설정을 나타내는 열거형 정의
 *
 * @author joohongpark
 */
const enum GameOption {
  GLOP10 = 'GLOP10', // 미정의
  GLOP20 = 'GLOP20', // 라켓길이 (짧게)
  GLOP21 = 'GLOP21', // 라켓길이 (보통)
  GLOP22 = 'GLOP22', // 라켓길이 (길게)
  GLOP30 = 'GLOP30', // 공속도 (느리게)
  GLOP31 = 'GLOP31', // 공속도 (보통)
  GLOP32 = 'GLOP32', // 공속도 (빠르게)
  GLOP40 = 'GLOP40', // 승리점수 (5점)
  GLOP41 = 'GLOP41', // 승리점수 (10점)
  GLOP42 = 'GLOP42', // 승리점수 (15점)
}
export default GameOption;
