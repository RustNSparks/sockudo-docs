# guide/index.md

# Sockudo Guide

Welcome to the Sockudo guide! This comprehensive documentation will walk you through everything you need to know to get Sockudo up and running, configure it for your needs, and understand its core features.

Sockudo is a high-performance WebSocket server built in Rust that is compatible with the Pusher protocol. This means you can use existing Pusher client libraries (like Laravel Echo, pusher-js, and others) to connect to Sockudo and build real-time applications.

## What is Sockudo?

Sockudo provides real-time, bidirectional communication between clients and servers using WebSockets. Key features include:

- **Pusher Protocol Compatibility**: Drop-in replacement for Pusher with existing client libraries
- **High Performance**: Built in Rust for speed and efficiency
- **Horizontal Scaling**: Multiple adapters for scaling across instances (Redis, NATS, Redis Cluster)
- **Flexible Storage**: Support for MySQL, PostgreSQL, DynamoDB, and in-memory app management
- **Comprehensive Features**: Rate limiting, webhooks, metrics, SSL/TLS, and more
- **Docker Ready**: Full Docker and Kubernetes support for modern deployments

## Quick Navigation

### Getting Started
- **[Getting Started](./getting-started.md)**: Install and run your first Sockudo server
- **[Channels](./channels.md)**: Understand public, private, and presence channels
- **[Configuration](./configuration.md)**: Comprehensive configuration guide

### Core Features
- **[Webhooks](./webhooks.md)**: Set up event notifications to your application
- **[Scaling](./scaling.md)**: Scale Sockudo using different adapters and load balancing
- **[Monitoring](./monitoring.md)**: Monitor performance with Prometheus and Grafana

### Operations
- **[Deployment](./deployment.md)**: Production deployment strategies and best practices
- **[Troubleshooting](./troubleshooting.md)**: Diagnose and solve common issues
- **[SSL Configuration](./ssl-configuration.md)**: Secure your connections with SSL/TLS

## Architecture Overview

Sockudo is designed with modularity and scalability in mind:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Load Balancer │    │    Sockudo      │
│  (Browser/App)  │◄──►│   (Nginx/HAProxy│◄──►│   Instances     │
│                 │    │   /K8s Ingress) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                             ┌────────────────────────┼────────────────────────┐
                             │                        │                        │
                    ┌─────────▼────────┐    ┌─────────▼────────┐    ┌─────────▼────────┐
                    │    Adapter       │    │   App Manager    │    │     Cache        │
                    │ (Redis/NATS/     │    │ (Memory/MySQL/   │    │ (Memory/Redis)   │
                    │  Local/Cluster)  │    │  Postgres/Dynamo)│    │                  │
                    └──────────────────┘    └──────────────────┘    └──────────────────┘
                             │                        │                        │
                    ┌─────────▼────────┐    ┌─────────▼────────┐    ┌─────────▼────────┐
                    │     Queue        │    │   Rate Limiter   │    │    Webhooks      │
                    │ (Memory/Redis/   │    │ (Memory/Redis)   │    │  (HTTP/Lambda)   │
                    │   SQS/Cluster)   │    │                  │    │                  │
                    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Key Components

- **Adapter**: Handles message broadcasting between instances for horizontal scaling
- **App Manager**: Manages application credentials and settings
- **Cache**: Improves performance by caching frequently accessed data
- **Queue**: Processes background tasks like webhook delivery
- **Rate Limiter**: Protects against abuse and ensures fair usage
- **Metrics**: Provides observability via Prometheus-compatible endpoints

## Use Cases

Sockudo is perfect for building:

### Real-Time Applications
- **Live Chat Systems**: Multi-user chat rooms with presence indicators
- **Collaborative Tools**: Real-time document editing, whiteboards
- **Gaming**: Multiplayer games with real-time state synchronization
- **Live Updates**: News feeds, social media updates, notification systems

### Business Applications
- **Dashboard Updates**: Real-time analytics and monitoring dashboards
- **Order Tracking**: Live order status updates for e-commerce
- **Customer Support**: Real-time customer service chat
- **Financial Data**: Live stock prices, trading platforms

### IoT and Monitoring
- **Device Monitoring**: Real-time sensor data and device status
- **Alert Systems**: Instant notifications for critical events
- **Live Metrics**: System performance and health monitoring

## Channel Types

Sockudo supports three types of channels, each designed for different use cases:

### Public Channels
- **No authentication required**
- **Open to all clients**
- **Perfect for**: Public announcements, news feeds, general updates

```javascript
const channel = pusher.subscribe('news-updates');
channel.bind('breaking-news', function(data) {
  console.log('Breaking news:', data);
});
```

### Private Channels
- **Require authentication**
- **Secure user-specific data**
- **Perfect for**: User notifications, private messages, secure updates

```javascript
const channel = pusher.subscribe('private-user-123');
channel.bind('new-message', function(data) {
  console.log('Private message:', data);
});
```

### Presence Channels
- **Require authentication**
- **Track who's online**
- **Perfect for**: Chat rooms, collaborative editing, multiplayer games

```javascript
const channel = pusher.subscribe('presence-chat-room');
channel.bind('pusher:member_added', function(member) {
  console.log('User joined:', member.id, member.info);
});
```

## Getting Started Path

If you're new to Sockudo, we recommend following this learning path:

### 1. Quick Start (30 minutes)
1. **[Install and run Sockudo](./getting-started.md)** with default settings
2. **Test basic connectivity** with a simple WebSocket client
3. **Send your first event** via the HTTP API

### 2. Basic Configuration (1 hour)
1. **[Configure your first application](./configuration/app-manager.md)** with custom credentials
2. **[Set up channels](./channels.md)** and understand the different types
3. **[Enable basic monitoring](./monitoring.md)** to see what's happening

### 3. Production Preparation (2-4 hours)
1. **[Configure SSL/TLS](./ssl-configuration.md)** for secure connections
2. **[Set up webhooks](./webhooks.md)** to react to events
3. **[Plan your scaling strategy](./scaling.md)** with appropriate adapters

### 4. Advanced Topics (As needed)
1. **[Deploy to production](./deployment.md)** with Docker/Kubernetes
2. **[Set up comprehensive monitoring](./monitoring.md)** with Prometheus/Grafana
3. **[Implement advanced features](./configuration.md)** like rate limiting and caching

## Configuration Overview

Sockudo's configuration is highly flexible and supports both JSON files and environment variables:

```json
{
  "debug": false,
  "host": "0.0.0.0",
  "port": 6001,
  "adapter": {
    "driver": "redis"
  },
  "app_manager": {
    "driver": "mysql"
  },
  "cache": {
    "driver": "redis"
  },
  "metrics": {
    "enabled": true,
    "port": 9601
  }
}
```

Or using environment variables:
```bash
HOST=0.0.0.0
PORT=6001
ADAPTER_DRIVER=redis
APP_MANAGER_DRIVER=mysql
CACHE_DRIVER=redis
METRICS_ENABLED=true
```

## Client Library Compatibility

Sockudo works with standard Pusher client libraries:

### JavaScript (Browser)
```javascript
import Pusher from 'pusher-js';

const pusher = new Pusher('your-app-key', {
  wsHost: 'your-sockudo-server.com',
  wsPort: 6001,
  forceTLS: true
});
```

### Laravel Echo
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: 'your-app-key',
  wsHost: 'your-sockudo-server.com',
  wsPort: 6001,
  forceTLS: true
});
```

### PHP
```php
use Pusher\Pusher;

$pusher = new Pusher(
  'your-app-key',
  'your-app-secret',
  'your-app-id',
  [
    'host' => 'your-sockudo-server.com',
    'port' => 6001,
    'scheme' => 'https'
  ]
);
```

## Community and Support

### Documentation
- **[Complete Configuration Reference](./configuration.md)**: Detailed configuration options
- **[Troubleshooting Guide](./troubleshooting.md)**: Solutions for common issues
- **[Deployment Guide](./deployment.md)**: Production deployment strategies

### Getting Help
- **[GitHub Issues](https://github.com/RustNSparks/sockudo/issues)**: Report bugs or request features
- **[GitHub Repository](https://github.com/RustNSparks/sockudo)**: Source code and documentation

### Community
- Check the project's GitHub repository for the latest updates and community discussions
- Review the main README.md file in the repository root for additional information
- Look for examples and sample configurations in the project repository

## What's Next?

Ready to get started? Here are your next steps:

1. **Begin with [Getting Started](./getting-started.md)** to install and run Sockudo
2. **Explore [Channels](./channels.md)** to understand how real-time communication works
3. **Dive into [Configuration](./configuration.md)** to customize Sockudo for your needs
4. **Set up [Monitoring](./monitoring.md)** to keep track of your server's performance
5. **Plan for [Production Deployment](./deployment.md)** when you're ready to go live

Whether you're building a simple chat application or a complex real-time system, Sockudo provides the performance, reliability, and flexibility you need to succeed.

Welcome to the world of high-performance real-time communication with Sockudo! 🚀
