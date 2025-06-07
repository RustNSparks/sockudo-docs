---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Sockudo"
  text: "High-Performance Pusher-Compatible WebSockets"
  tagline: Built with Rust for speed, reliability, and seamless integration with your existing applications.
  image:
    src: /logo.svg # Make sure this path is correct relative to your `public` directory
    alt: Sockudo Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/RustNSparks/sockudo

features:
  - title: Blazing Fast & Efficient
    details: Leveraging Rust's performance and memory safety, Sockudo is designed for high-throughput and low-latency real-time communication.
    icon: 🚀
  - title: Pusher Protocol Compatible
    details: Seamlessly integrate with Laravel Echo and other Pusher client libraries. Drop-in replacement for existing Pusher setups.
    icon: 🔌
  - title: Modular & Extensible
    details: Flexible architecture with swappable components for adapters (Redis, NATS, Local), app management (Memory, MySQL, DynamoDB), and caching.
    icon: 🧱
  - title: Scalable Architecture
    details: Built-in support for horizontal scaling using Redis, Redis Cluster, or NATS adapters to handle growing user loads.
    icon: ⚖️
  - title: Robust & Secure
    details: Features like channel authentication, rate limiting, and webhook integrations to build secure and reliable real-time applications.
    icon: 🛡️
  - title: Monitoring & Metrics
    details: Integrated Prometheus metrics endpoint for comprehensive performance monitoring and operational insights.
    icon: 📊
---

## What is Sockudo?

Sockudo is a robust, memory-efficient WebSockets server written in Rust. It's fully compatible with the Pusher protocol, providing a seamless integration path for applications currently using Pusher or those looking for a high-performance alternative, especially within the Laravel ecosystem with Laravel Echo.

Our goal is to provide a modern, scalable, and easy-to-use WebSocket solution that developers can rely on for their real-time communication needs.

<div style="margin-top: 2rem; text-align: center;">
  <a href="/guide/getting-started" class="VPButton brand" style="margin-right: 0.5rem;">Dive into the Guide &rarr;</a>
  <a href="/concepts/architecture" class="VPButton alt">Learn Core Concepts</a>
</div>

## Why Choose Sockudo?

* **Performance**: Experience significantly lower resource consumption and higher message throughput compared to solutions in other languages.
* **Ease of Migration**: If you're already using Pusher, migrating to Sockudo can be as simple as changing a few configuration lines.
* **Cost-Effective**: Higher efficiency can lead to lower server costs, especially at scale.
* **Modern Stack**: Built with Rust, a language known for its safety, speed, and concurrency features.
* **Open Source**: Sockudo is open source and community-driven. We welcome contributions and feedback!

Ready to give it a try? Check out the [**Getting Started**](/guide/getting-started) guide.
