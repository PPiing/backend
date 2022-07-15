import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FriendsService } from './friends.service';

@WebSocketGateway({ namespace: 'friends' })
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(FriendsGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private frinedsService: FriendsService,
  ) {}

  async handleConnection(client: any) {
    const { userSeq } = client.request.user;
    await this.frinedsService.onlineUserAdd(client, userSeq);
  }

  async handleDisconnect(client: any) {
    const { userSeq } = client.request.user;
    await this.frinedsService.onlineUserRemove(client, userSeq);
  }

  @OnEvent('friends:update')
  async onFriendsUpdate(userSeq1: number, userSeq2: number) {
    this.logger.debug('frineds udpate');
    const target1 = await this.frinedsService.getOnlineClients(userSeq1);
    if (target1.length > 0) {
      this.server.to(target1).emit('friends:update');
    }

    const target2 = await this.frinedsService.getOnlineClients(userSeq2);
    if (target2.length > 0) {
      this.server.to(target2).emit('friends:update');
    }
  }
}
