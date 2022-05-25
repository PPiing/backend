/**
 * 유저 상태를 나타내는 열거형 정의
 *
 * @author joohongpark
 */
const enum UserStatus {
  USST10 = 'USST10', // 온라인
  USST20 = 'USST20', // 오프라인
  USST30 = 'USST30', // 게임중
  USST40 = 'USST40', // 자리비움
}
export default UserStatus;
