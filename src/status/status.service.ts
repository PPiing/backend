import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
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
  saveClient(client: Socket) {
    // cache에 저장

    // NOTE: 만약 로그인할때 status를 별도로 저장하지 않는다면 updateStatus를 호출해야 된다.
  }

  /**
   * 접속을 죵료하였을 때
   * client의 정보와 현재의 상태를 offline으로 저장한다.
   *
   * @param client 접속된 client socket
   */
  async removeClient(client: Socket) {
    // cache에서 삭제
    // await repository의 updateStatus 호출
  }

  /**
   * 상태를 업데이트 할때 (게임중 or 온라인으로 변경 가능)
   *
   * @param client 접속된 client socket
   * @param status 상태 (enum으로 변경 예정)
   */
  async updateStatus(client: Socket, status: string) {
    // cache에 저장되어 있는 정보 UPDATE

    // await repository의 updateStatus 호출
  }

}
