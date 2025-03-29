import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: '*' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}
  private clients = new Map<string, Socket>();
  afterInit(server: Server) {
    console.log('websocket server initialized');
  }
  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
    this.clients.set(client.id, client);
    client.emit('connection_status', 'Connected to websocket server');
  }
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }
  async sendNotification(user_id: string, message: string) {
    await this.prisma.notification.create({
      data: { user_id, message, read: false },
    });
    for (const client of this.clients.values()) {
      client.emit('notification', message);
    }
  }
}
