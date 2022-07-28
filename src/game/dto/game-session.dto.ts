import { UserDto } from 'src/user/dto/user.dto';

/** TODO: add userName in session */
export class GameSession extends UserDto {
  roomId: string;
}
