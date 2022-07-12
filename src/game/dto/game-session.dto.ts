import {
  IsBoolean, IsNumber, IsString, IsUUID,
} from 'class-validator';

/** TODO: add userName in session */
export class GameSession {
  @IsUUID()
    sessionId: string;

  @IsNumber()
    userId: number;

  @IsString()
    roomId: string;

  @IsBoolean()
    inGame: boolean;
}
