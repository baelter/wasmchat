#!/usr/bin/env node

/**
 * Test script to consume messages from chat-stream-general queue
 * Using @cloudamqp/amqp-client over TCP connection to LavinMQ
 */

import { AMQPClient } from '@cloudamqp/amqp-client';

async function testConsumer() {
  console.log('Starting AMQP TCP consumer test...');

  // Connection configuration for LavinMQ over TCP
  const config = {
    hostname: 'localhost',
    port: 5672, // Standard AMQP TCP port
    vhost: '/',
    username: 'guest',
    password: 'guest',
  };

  let connection;
  let channel;

  // Create TCP connection to LavinMQ
  console.log(`Connecting to amqp://${config.username}@${config.hostname}:${config.port}${config.vhost}`);

  connection = new AMQPClient(`amqp://${config.username}:${config.password}@${config.hostname}:${config.port}${config.vhost}`);
  await connection.connect();
  console.log('✅ Connected to LavinMQ over TCP');

  // Create a channel
  channel = await connection.channel();
  console.log('✅ Channel created');

  await channel.basicQos(1);

  // Queue name that matches the web app
  const queueName = 'chat-stream-general';

  // Declare a simple queue for testing
  const queue = await channel.queue(queueName,
    {
      durable: true,
    },
    {
      'x-queue-type': 'stream',
      'x-max-age': '1h'
    }
  );
  console.log(`✅ Queue '${queueName}' declared`);


  // Set up consumer
  console.log(`🔄 Starting to consume from queues...`);
  console.log('Press Ctrl+C to exit');

  // Try consuming from our test queue first
  const consumer = await queue.subscribe(
    {
      args: {
        'x-stream-offset': 'last',
      },
      noAck: false
    },
    (message) => {
      try {
        const content = message.bodyToString();
        const timestamp = new Date().toISOString();

        console.log('\n📨 Message received (from test queue):');
        console.log(`   Time: ${timestamp}`);
        console.log(`   Content: ${content}`);

        // Try to parse as JSON for better formatting
        try {
          const parsed = JSON.parse(content);
          console.log('   Parsed JSON:');
          console.log(`     Type: ${parsed.type || 'unknown'}`);
          console.log(`     Channel: ${parsed.channel || 'unknown'}`);
          console.log(`     Username: ${parsed.username || 'system'}`);
          console.log(`     Message: ${parsed.content || content}`);
          console.log(`     Timestamp: ${parsed.timestamp || 'N/A'}`);
        } catch {
          console.log('   Raw message (not JSON)');
        }

        // Acknowledge the message
        message.ack();
      } catch (error) {
        console.error('❌ Error processing message:', error);
        message.nack(false, false); // Reject without requeue
      }
    }
  );
  console.log(`✅ Consumer started`);
  await consumer.wait();
}

// Run the test
testConsumer()
