import { Logger } from '@nestjs/common';
import {
  WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'alarm' })
export class AlarmGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AlarmGateway.name);

  @WebSocketServer()
  private server: Server;

  afterInit(server: any) {
    this.logger.log('AlarmGateway initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }
}
