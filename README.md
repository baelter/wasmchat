# WamsChat

A client-side chat application demonstrating real-time messaging using AMQP streams over WebSockets without traditional backend infrastructure.

## Features

- 🚀 **Zero Backend**: Pure client-side application using AMQP streams
- 💬 **Real-time Chat**: Instant messaging across multiple channels
- 🌊 **AMQP Streams**: Leverages LavinMQ's stream capabilities for message persistence
- 🎨 **Modern UI**: Custom CSS with a Discord-inspired design
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Fast**: Built with Vite for optimal development experience
- 🧪 **Tested**: Comprehensive test suite with Vitest

## Architecture

This application showcases how modern web applications can communicate directly with message brokers without requiring custom backend APIs:

```
Web Browser ←→ WebSocket ←→ LavinMQ AMQP Broker
     ↑                              ↑
   amqp-client.js              AMQP Streams
```

### Key Components

- **AmqpConnectionManager**: Handles WebSocket connection to LavinMQ
- **ChatChannelManager**: Manages AMQP streams for different chat channels
- **ChatUIManager**: Handles all user interface interactions

## Prerequisites

- **LavinMQ**: Running on `localhost:15692` (WebSocket port)
- **Node.js**: Version 18+ for development tools

### LavinMQ Setup

1. Install LavinMQ following the [official documentation](https://lavinmq.com/)
2. Ensure WebSocket support is enabled on port 15692
3. Default credentials used: `guest/guest` on vhost `/`

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wamschat

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

The AMQP connection details are currently hardcoded in `src/js/amqp-connection.js`:

```javascript
this.config = {
  hostname: 'localhost',
  port: 15692,
  vhost: '/',
  username: 'guest',
  password: 'guest',
};
```

For production use, these should be made configurable through environment variables or a configuration file.

## How It Works

1. **Connection**: The app connects to LavinMQ via WebSocket using `amqp-client.js`
2. **Channels**: Each chat channel corresponds to an AMQP stream
3. **Messages**: Messages are published to exchanges and consumed from streams
4. **Persistence**: AMQP streams provide message persistence and replay capabilities
5. **Real-time**: WebSocket connection ensures instant message delivery

## Project Structure

```
src/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Custom CSS styling
└── js/
    ├── main.js             # Application entry point
    ├── amqp-connection.js  # AMQP WebSocket connection management
    ├── chat-channel-manager.js  # Channel and message management
    └── chat-ui-manager.js  # User interface management

test/
├── chat-channel-manager.test.js  # Channel manager tests
└── chat-ui-manager.test.js       # UI manager tests
```

## Development Tools

- **Vite**: Modern build tool and dev server
- **ESLint**: Code linting with recommended rules
- **Prettier**: Code formatting
- **Vitest**: Fast unit testing framework

## Browser Support

This application uses modern JavaScript features and is compatible with:

- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [LavinMQ](https://lavinmq.com/) for providing a modern AMQP broker with WebSocket support
- [amqp-client.js](https://github.com/cloudamqp/amqp-client.js) for the WebSocket AMQP client library
