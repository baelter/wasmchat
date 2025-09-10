/**
 * WamsChat - AMQP Stream Chat Application
 * Main application entry point
 */

import { AmqpConnectionManager } from './amqp-connection.js';
import { ChatChannelManager } from './chat-channel-manager.js';
import { ChatUIManager } from './chat-ui-manager.js';

class WamsChatApp {
  constructor() {
    this.amqpConnection = new AmqpConnectionManager();
    this.channelManager = new ChatChannelManager(this.amqpConnection);
    this.uiManager = new ChatUIManager(this.channelManager);

    this.bindConnectionEvents();
    this.initialize();
  }

  bindConnectionEvents() {
    this.amqpConnection.addEventListener('connecting', () => {
      console.log('Connecting to AMQP broker...');
      this.uiManager.updateConnectionStatus('connecting');
    });

    this.amqpConnection.addEventListener('connected', () => {
      console.log('Connected to AMQP broker');
      this.uiManager.updateConnectionStatus('connected');
    });

    this.amqpConnection.addEventListener('disconnected', () => {
      console.log('Disconnected from AMQP broker');
      this.uiManager.updateConnectionStatus('disconnected');
      this.uiManager.disableChatInterface();
    });

    this.amqpConnection.addEventListener('error', event => {
      console.error('AMQP connection error:', event.detail);
      this.uiManager.updateConnectionStatus('error');
      this.uiManager.showError('Connection failed. Please check the AMQP broker.');
    });
  }

  async initialize() {
    try {
      // Show username modal immediately
      this.uiManager.showUsernameModal();

      // Connect to AMQP broker
      await this.amqpConnection.connect();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.uiManager.showError('Failed to start the application');
    }
  }

  async shutdown() {
    console.log('Shutting down WamsChat...');

    // Unsubscribe from channels
    const username = this.uiManager.getUsername();
    if (username) {
      const channels = this.channelManager.getChannels();
      for (const channel of channels) {
        try {
          await this.channelManager.unsubscribeFromChannel(channel, username);
        } catch (error) {
          console.error(`Failed to unsubscribe from ${channel}:`, error);
        }
      }
    }

    // Disconnect from AMQP
    await this.amqpConnection.disconnect();
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new WamsChatApp();

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    app.shutdown();
  });

  // Make app available globally for debugging
  window.wamsChatApp = app;
});

export { WamsChatApp };
