# WamsChat

A client-side chat application using AMQP streams over WebSockets.

![WamsChat Screenshot](resources/screenshot.png)

## Features

- 🚀 **Zero Backend**: Pure client-side application using AMQP streams
- 💬 **Real-time Chat**: Instant messaging across multiple channels
- 📱 **Direct Messages**: Private messaging between users
- 🌊 **AMQP Streams**: Message persistence with LavinMQ

## Prerequisites

- **LavinMQ** running on `localhost:15692` (WebSocket port)
- **Node.js** 18+ for development

## Getting Started

```bash
# Install and run
npm install
npm run dev
```

Open <http://localhost:3001> to start chatting.

## How It Works

The app connects directly to LavinMQ via WebSocket using `amqp-client.js`. Each chat channel is an AMQP stream, providing real-time messaging with built-in persistence.
