/**
 * Mock WebSocket AMQP Server for Development
 * This simulates an AMQP broker for testing the chat application
 */

import WebSocket, { WebSocketServer } from 'ws';

class MockAmqpServer {
  constructor(port = 15692) {
    this.port = port;
    this.wss = null;
    this.clients = new Map();
    this.channels = new Map();
    this.messages = new Map(); // Store messages per channel
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        channels: new Set(),
      });

      console.log(`Client ${clientId} connected`);

      ws.on('message', data => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        this.clients.delete(clientId);
      });

      ws.on('error', error => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send connection acknowledgment
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
      }));
    });

    console.log(`Mock AMQP server started on ws://localhost:${this.port}/ws`);
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'publish':
        this.handlePublish(clientId, message);
        break;
      case 'consume':
        this.handleConsume(clientId, message);
        break;
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  handlePublish(clientId, message) {
    const { exchange, routingKey, message: content } = message;

    // Store the message
    const channelKey = `${exchange}:${routingKey}`;
    if (!this.messages.has(channelKey)) {
      this.messages.set(channelKey, []);
    }

    const messageObj = {
      id: this.generateMessageId(),
      exchange,
      routingKey,
      content,
      timestamp: Date.now(),
      clientId,
    };

    this.messages.get(channelKey).push(messageObj);

    // Broadcast to all subscribers of this channel
    this.broadcastToChannel(channelKey, messageObj);
  }

  handleSubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    const { channel } = message;

    client.channels.add(channel);

    // Send recent messages for this channel
    const messages = this.messages.get(channel) || [];
    const recentMessages = messages.slice(-10); // Last 10 messages

    recentMessages.forEach(msg => {
      client.ws.send(JSON.stringify({
        type: 'message',
        message: msg.content,
        metadata: {
          exchange: msg.exchange,
          routingKey: msg.routingKey,
          timestamp: msg.timestamp,
        },
      }));
    });
  }

  broadcastToChannel(channelKey, messageObj) {
    this.clients.forEach((client, clientId) => {
      if (client.channels.has(channelKey) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'message',
          message: messageObj.content,
          metadata: {
            exchange: messageObj.exchange,
            routingKey: messageObj.routingKey,
            timestamp: messageObj.timestamp,
          },
        }));
      }
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('Mock AMQP server stopped');
    }
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MockAmqpServer();
  server.start();

  process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
  });
}

export { MockAmqpServer };
