import {
  IsString, IsNotEmpty, IsBoolean,
} from 'class-validator';

export class CreateRoomDto {
  /**
   * CHTP10 : 개인 채팅방 (DM)
   * CHTP20 : 단체 채팅방 (public)
   * CHTP30 : 단체 채팅방 (protected)
   * CHTP40 : 비밀 채팅방 (private)
   */
  @IsString()
  @IsNotEmpty()
    chatType: string;

  @IsString()
  @IsNotEmpty()
    chatName: string; // NOTE: dm인 경우는 없어도 될 듯...

  @IsString()
  @IsNotEmpty()
    password: string;

  @IsBoolean()
  @IsNotEmpty()
    isDirected: boolean;
}
