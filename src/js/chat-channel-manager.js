/**
 * Chat Channel Manager
 * Manages AMQP streams for chat channels
 */

class ChatChannelManager extends EventTarget {
  constructor(amqpConnection) {
    super();
    this.amqpConnection = amqpConnection;
    this.channels = new Map();
    this.activeChannel = null;
    this.messageHandlers = new Map();
    this.userSessions = new Map();
    this.userNotificationChannel = null; // For user-specific notifications
  }

  async createChannel(channelName) {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const connection = this.amqpConnection.connection;
    if (!connection) {
      throw new Error('AMQP connection not available');
    }

    // Create a stream for this channel using WebSocket client API
    const queueName = `chat-stream-${channelName}`;
    const channel = await connection.channel()
    await channel.basicQos(1000);
    const queue = await channel.queue(queueName,
      {
        durable: true,
      },
      {
        'x-queue-type': 'stream',
        'x-max-age': '1h'
      }
    );
    await queue.bind("amq.topic", channelName);

    const channelInfo = {
      name: channelName,
      queue,
      consumer: null,
    };

    this.channels.set(channelName, channelInfo);
    this.dispatchEvent(
      new CustomEvent('channelCreated', {
        detail: { channelName },
      })
    );

    return channelInfo;
  }

  async subscribeToChannel(channelName, username) {
    const channelInfo = await this.createChannel(channelName);

    if (channelInfo.consumer) {
      // Already subscribed
      return;
    }

    // Subscribe using WebSocket client API
    const consumer = await channelInfo.queue.subscribe(
      {
        args: {
          'x-stream-offset': 0,
        },
        noAck: false
       },
      (message) => {
        console.log('Received message:', new Date().toLocaleTimeString(), message.bodyToString());
        this.handleMessage(channelName, message);
      });
    console.log('Subscribed to channel:', channelName);

    channelInfo.consumer = consumer;
    this.activeChannel = channelName;

    // Send join message
    await this.sendSystemMessage(channelName, `${username} joined the channel`);

    this.dispatchEvent(
      new CustomEvent('channelSubscribed', {
        detail: { channelName },
      })
    );
  }

  async unsubscribeFromChannel(channelName, username) {
    const channelInfo = this.channels.get(channelName);
    if (!channelInfo || !channelInfo.consumer) {
      return;
    }

    // Send leave message before unsubscribing
    await this.sendSystemMessage(channelName, `${username} left the channel`);

    // Unsubscribe using WebSocket client API
    await channelInfo.consumer.cancel();
    channelInfo.consumer = null;

    this.dispatchEvent(
      new CustomEvent('channelUnsubscribed', {
        detail: { channelName },
      })
    );
  }

  async sendMessage(channelName, username, content) {
    const channelInfo = this.channels.get(channelName);
    if (!channelInfo) {
      throw new Error(`Channel ${channelName} not found`);
    }

    const message = {
      id: this.generateMessageId(),
      type: 'message',
      channel: channelName,
      username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    await channelInfo.queue.publish(
      JSON.stringify(message),
      {
        persistent: true,
      }
    );
  }

  async sendSystemMessage(channelName, content) {
    const channelInfo = this.channels.get(channelName);
    if (!channelInfo) {
      return;
    }

    const message = {
      id: this.generateMessageId(),
      type: 'system',
      channel: channelName,
      content,
      timestamp: new Date().toISOString(),
    };

    await channelInfo.queue.publish(
      JSON.stringify(message),
      {
        persistent: true,
      }
    );
  }

  handleMessage(channelName, amqpMessage) {
    const messageContent = amqpMessage.bodyToString();
    const message = JSON.parse(messageContent);

    this.dispatchEvent(
      new CustomEvent('messageReceived', {
        detail: { channelName, message },
      })
    );

    amqpMessage.ack().then(() => {
      // Message acknowledged
    });
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getChannels() {
    return Array.from(this.channels.keys());
  }

  async subscribeToUserNotifications(username) {
    const notificationChannelName = `user-notifications-${username}`;

    console.log(`Attempting to subscribe to user notifications for: ${username}, channel: ${notificationChannelName}`);

    try {
      const channelInfo = await this.createChannel(notificationChannelName);

      if (channelInfo.consumer) {
        // Already subscribed to notification channel
        console.log(`Already subscribed to notification channel: ${notificationChannelName}`);
        return;
      }

      const consumer = await channelInfo.queue.subscribe(
        {
          args: {
            'x-stream-offset': 0,
          },
          noAck: false
        },
        (message) => {
          console.log('Received user notification:', new Date().toLocaleTimeString(), message.bodyToString());
          this.handleUserNotification(message);
        }
      );

      channelInfo.consumer = consumer;
      this.userNotificationChannel = channelInfo;
      console.log('Successfully subscribed to user notification channel:', notificationChannelName);
    } catch (error) {
      console.error('Failed to subscribe to user notification channel:', error);
      throw error;
    }
  }

  async sendDMInitiationNotification(fromUsername, toUsername, dmChannelName) {
    // Send notification to the recipient's notification queue
    const recipientNotificationChannel = `user-notifications-${toUsername}`;

    console.log(`Attempting to send DM initiation from ${fromUsername} to ${toUsername}, channel: ${recipientNotificationChannel}`);

    try {
      const channelInfo = await this.createChannel(recipientNotificationChannel);

      const notification = {
        id: this.generateMessageId(),
        type: 'dm-initiation',
        from: fromUsername,
        to: toUsername,
        dmChannel: dmChannelName,
        timestamp: new Date().toISOString(),
      };

      await channelInfo.queue.publish(
        JSON.stringify(notification),
        {
          persistent: true,
        }
      );

      console.log(`Successfully sent DM initiation notification to ${toUsername}`);
    } catch (error) {
      console.error('Failed to send DM initiation notification:', error);
    }
  }

  handleUserNotification(amqpMessage) {
    const messageContent = amqpMessage.bodyToString();
    const notification = JSON.parse(messageContent);

    this.dispatchEvent(
      new CustomEvent('userNotificationReceived', {
        detail: { notification },
      })
    );

    amqpMessage.ack().then(() => {
      // Notification acknowledged
    });
  }

  getActiveChannel() {
    return this.activeChannel;
  }
}

export { ChatChannelManager };
