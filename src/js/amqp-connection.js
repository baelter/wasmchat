/**
 * AMQP Connection Manager
 * Handles WebSocket connection to LavinMQ AMQP broker using CloudAMQP client
 */

import { AMQPWebSocketClient } from '@cloudamqp/amqp-client/amqp-websocket-client';

class AmqpConnectionManager extends EventTarget {
  constructor() {
    super();
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;

    // Use environment variables for connection details
    this.config = {
      hostname: import.meta.env.VITE_AMQP_HOST || 'localhost',
      port: parseInt(import.meta.env.VITE_AMQP_WS_PORT) || 15672,
      vhost: import.meta.env.VITE_AMQP_VHOST || '/',
      username: import.meta.env.VITE_AMQP_USERNAME || 'guest',
      password: import.meta.env.VITE_AMQP_PASSWORD || 'guest',
    };
  }

  async connect() {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.dispatchEvent(new CustomEvent('connecting'));

    try {
      // Connect to LavinMQ using CloudAMQP WebSocket client
      const url = `ws://${this.config.hostname}:${this.config.port}`;

      this.connection = new AMQPWebSocketClient(
        url,
        this.config.vhost,
        this.config.username,
        this.config.password
      );

      await this.connection.connect();
      this.channel = await this.connection.channel();

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      this.dispatchEvent(new CustomEvent('connected'));

      // Set up connection event handlers
      this.connection.onerror = _error => {
        this.handleDisconnection();
      };

      this.connection.onclose = () => {
        this.handleDisconnection();
      };

    } catch (error) {
      this.isConnecting = false;
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      this.scheduleReconnect();
    }
  }

  handleDisconnection() {
    if (!this.isConnected) return;

    this.isConnected = false;
    this.isConnecting = false;
    this.connection = null;
    this.channel = null;

    this.dispatchEvent(new CustomEvent('disconnected'));
    this.scheduleReconnect();
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch {
        // Silent error handling
      }
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.connection = null;
    this.channel = null;
  }

  getChannel() {
    return this.channel;
  }
}

export { AmqpConnectionManager };
