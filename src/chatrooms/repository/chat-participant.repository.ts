/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import ChatParticipant from 'src/entities/chat-participant.entity';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import { EntityRepository, Repository } from 'typeorm';
import { ChatParticipantDto } from '../dto/chat-participant.dto';

@EntityRepository(ChatParticipant)
export default class ChatParticipantRepository extends Repository<ChatParticipant> {
  /**
   * 채팅방의 신규 참여자를 추가합니다.
   *
   * @param userid 참여자 ID
   * @param roomid 방 ID
   * @param auth 권한
   */
  async saveChatParticipants(userid: number, roomid: number, auth: PartcAuth): Promise<void> {
  }

  /**
   * 방 ID로 방의 참여자를 조회합니다.
   *
   * @param roomid 방 ID
   * @returns 상세 정보 배열
   */
  async getChatParticipantsByRoomid(roomid: number): Promise<ChatParticipantDto[]> {
    return [];
  }

  /**
   * 유저 ID로 유저가 참여한 채팅방을 조회합니다.
   *
   * @param userid 참여자 ID
   * @returns 상세 정보 배열
   */
  async getChatParticipantsByUserid(userid: number): Promise<ChatParticipantDto[]> {
    return [];
  }

  /**
   * 유저 ID로 유저가 참여한 채팅방의 ID를 조회합니다.
   *
   * @param id 참여자 ID
   * @returns 채팅방 ID 배열
   */
  async findRoomsByUserId(id: number): Promise<number[]> {
    return [];
  }

  /**
   * 특정 방에 속한 특정 유저에 대한 상세 정보를 조회합니다. 정보가 없을 경우 undefined를 반환합니다.
   *
   * @param chatSeq 방 ID
   * @param userId 참여자 ID
   * @returns 상세 정보 or undefined
   */
  async getChatParticipantByUserIdAndRoomId(
    chatSeq: number,
    userId: number,
  ): Promise<ChatParticipantDto | undefined> {
    return undefined;
  }

  /**
   * 채팅방에 유저들을 추가합니다.
   *
   * @param chatSeq 방 ID
   * @param users 유저 ID 배열
   */
  async addUsers(chatSeq: number, users: number[]): Promise<void> {
  }

  /**
   * 특정 방에 속한 특정 유저의 권한을 변경합니다.
   *
   * @param chatSeq 방 ID
   * @param user 유저 ID
   * @param partcAuth 권한
   */
  async changeUserAuth(chatSeq: number, user: number, partcAuth: PartcAuth): Promise<void> {
  }

  /**
   * 채팅방에 유저를 제거합니다. 만약 유저가 존재하지 않았다면 false를 반환합니다.
   *
   * @param chatSeq 방 ID
   * @param user 유저 ID
   */
  async removeUser(chatSeq: number, user: number): Promise<boolean> {
    return true;
  }
}
