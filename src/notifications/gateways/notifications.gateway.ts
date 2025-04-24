import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationsService } from '../services/notifications.service';
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
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Socket>(); // Track connected clients using Map

  afterInit(server: Server) {
    console.log('websocket server initialized');
  }

  // Triggered when a new client connects
  handleConnection(client: Socket) {
    const clientId = client.id; // Use client id or extract user_id if you have authentication

    // Check if client is already connected
    if (this.clients.has(clientId)) {
      console.log(
        `Client ${clientId} is already connected. Skipping connection.`,
      );
      return; // Prevent multiple connections for the same client
    }

    // Log and add client to the map
    console.log(`Client connected: ${clientId}`);
    this.clients.set(clientId, client);
    client.emit('connection_status', 'Connected to websocket server');
  }

  // Triggered when a client disconnects
  handleDisconnect(client: Socket) {
    const clientId = client.id;
    console.log(`Client disconnected: ${clientId}`);

    // Clean up the client connection from the map
    this.clients.delete(clientId);
  }

  // Example method to send a broadcast notification
  async sendBroadcastNotification(user_id: string, message: string) {
    // Save notification to database
    await this.prisma.notification.create({
      data: { user_id, message, read: false },
    });

    // Emit notification to all connected clients
    for (const client of this.clients.values()) {
      client.emit('notification', message);
    }
  }

  // Example method to send a personal notification
  async sendPersonalNotification(user_id: string, message: string) {
    const client = this.clients.get(user_id); // Find the specific client using user_id
    if (client) {
      await this.prisma.notification.create({
        data: { user_id, message, read: false },
      });
      client.emit('notification', message);
    } else {
      console.log(`No client found for user: ${user_id}`);
    }
  }

  @SubscribeMessage('mark-notifications-read')
  async notificationRead(@ConnectedSocket() client: Socket) {
    const updated = await this.prisma.notification.updateMany({
      data: { read: true },
    });
    if (updated) {
      console.log('Notification updated successfully');
      client.emit('notification-read', {
        message: 'Notification updated successfully',
      });
    }
  }

  @SubscribeMessage('broadcast-message')
  async BroadCastMessage(@MessageBody() message: string) {
    this.server.emit('notification', message);
    console.log('broadcast', message);
  }
}
