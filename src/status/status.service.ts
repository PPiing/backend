import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import UserStatus from 'src/enums/mastercode/user-status.enum';
import StatusRepository from './status.repository';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(
    private statusRepository: StatusRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * 처음 접속했을 때
   * client의 정보와 현재의 상태를 online으로 저장한다.
   *
   * @param client 접속된 client socket
   */
  async saveClient(client: Socket, userSeq: number) {
    this.cacheManager.set(client.id, userSeq, { ttl: 0 });

    await this.statusRepository.updateStatus(userSeq, UserStatus.USST10);
  }

  /**
   * 접속을 죵료하였을 때
   * client의 정보와 현재의 상태를 offline으로 저장한다.
   *
   * @param client 접속된 client socket
   */
  async removeClient(client: Socket) {
    // userSeq 저장
    const userSeq: number = await this.cacheManager.get(client.id);

    // cache에서 삭제
    this.cacheManager.del(client.id);

    await this.statusRepository.updateStatus(userSeq, UserStatus.USST20);
  }

  /**
   * 상태를 업데이트 할때 (게임중 or 온라인으로 변경 가능)
   *
   * @param client 접속된 client socket
   * @param status 상태 (enum으로 변경 예정)
   */
  async updateStatus(client: Socket, status: UserStatus) {
    // cache에 저장되어 있는 정보 UPDATE
    const userSeq: number = await this.cacheManager.get(client.id);

    // await repository의 updateStatus 호출
    await this.statusRepository.updateStatus(userSeq, status);
  }
}
