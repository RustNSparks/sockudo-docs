# /docs/guide/scaling.md

# Scaling Sockudo

Sockudo is designed to handle a significant number of concurrent connections on a single instance due to its Rust-based architecture. However, to achieve higher availability and scale beyond the capacity of a single server, you'll need to run multiple Sockudo instances in a cluster. This is where **Adapters** come into play.

## The Role of Adapters

When you run multiple Sockudo instances, they need a way to communicate with each other. Specifically, if a client connected to `Sockudo Instance A` sends a message to a channel, and another client subscribed to the same channel is connected to `Sockudo Instance B`, Instance B needs to receive that message to deliver it to its client.

Adapters solve this problem by providing a publish/subscribe (Pub/Sub) mechanism that all Sockudo instances connect to. When an event is published on one instance, it's sent to the adapter, which then broadcasts it to all other subscribed instances. These instances then deliver the message to their connected clients.

Sockudo supports several adapters, configured in the `adapter` section of your `config.json`:

```json
// Part of config.json
"adapter": {
  "driver": "local", // "redis", "redis_cluster", "nats"
  // ... driver-specific settings
}
```

## Supported Adapters

### 1. `local` Adapter

-   **Driver:** `local`
-   **Description:** This is the default adapter. It does not use any external messaging system.
-   **Use Case:** Suitable only for single-instance Sockudo deployments. **It does not support horizontal scaling.**
-   **Configuration:**
    ```json
    "adapter": {
      "driver": "local"
    }
    ```

### 2. `redis` Adapter

-   **Driver:** `redis`
-   **Description:** Uses Redis Pub/Sub to broadcast messages between Sockudo instances. Each instance subscribes to relevant Redis channels and publishes messages through Redis.
-   **Requirements:** A running Redis server (version 2.6.0 or higher for Pub/Sub).
-   **Use Case:** A popular and robust choice for scaling.
-   **Configuration:**
    ```json
    "adapter": {
      "driver": "redis",
      "redis_settings": {
        "dsn": "redis://your-redis-host:6379/0" // Redis connection string
      }
    }
    ```
    *(Refer to `src/adapter/redis_adapter.rs` for specific implementation details.)*

### 3. `redis_cluster` Adapter

-   **Driver:** `redis_cluster`
-   **Description:** Similar to the `redis` adapter, but designed to work with a Redis Cluster setup for higher availability and sharding of the Pub/Sub workload.
-   **Requirements:** A running Redis Cluster.
-   **Use Case:** For large-scale deployments requiring a highly available Redis backend.
-   **Configuration:**
    ```json
    "adapter": {
      "driver": "redis_cluster",
      "redis_cluster_settings": {
        "dsns": [ // List of initial node addresses in the cluster
          "redis://node1.example.com:7000",
          "redis://node2.example.com:7001"
        ]
      }
    }
    ```
    *(Refer to `src/adapter/redis_cluster_adapter.rs`.)*

### 4. `nats` Adapter

-   **Driver:** `nats`
-   **Description:** Uses NATS.io, a high-performance messaging system, for inter-instance communication.
-   **Requirements:** A running NATS server or cluster.
-   **Use Case:** Suitable for environments already using NATS or those looking for a lightweight, fast messaging backbone.
-   **Configuration:**
    ```json
    "adapter": {
      "driver": "nats",
      "nats_settings": {
        "url": "nats://your-nats-host:4222", // NATS server URL
        "subject_prefix": "sockudo_events" // Optional prefix for NATS subjects
      }
    }
    ```
    *(Refer to `src/adapter/nats_adapter.rs`.)*

## Load Balancing

When running multiple Sockudo instances, you'll also need a load balancer in front of them to distribute client WebSocket connections and HTTP API requests.

-   **WebSocket Connections:** Use a Layer 4 (TCP) or Layer 7 (HTTP/WebSocket) load balancer.
    -   **Sticky Sessions (Affinity):** Crucially, for WebSocket connections, you usually need to configure sticky sessions (also known as session affinity or source IP hashing) if your load balancer or Sockudo itself doesn't handle connection state being distributed. This ensures that subsequent requests for an established WebSocket connection are routed to the same Sockudo instance that initially handled the handshake. However, with a robust adapter handling message broadcasting, the strict need for stickiness for the *data phase* of WebSockets might be relaxed, as any server can receive an HTTP trigger and broadcast it. The initial connection establishment might still benefit from even distribution. Pusher itself often doesn't require sticky sessions at the LB layer because the connection is long-lived and state is handled by the backend cluster.
    -   Sockudo's design with adapters aims to make individual instances stateless regarding message delivery across the cluster, reducing the strict requirement for sticky sessions for the *entire duration* of the WebSocket. However, the initial handshake and connection management are per-instance.

-   **HTTP API Requests:** These are typically stateless and can be distributed using standard round-robin or least-connections algorithms by a Layer 7 load balancer.

## Considerations for Scaled Deployments

-   **Configuration Consistency:** Ensure all Sockudo instances in the cluster use identical application configurations (`app_manager.apps` settings like keys, secrets, webhook URLs, etc.). The app definitions themselves might be loaded from a shared database if using `mysql` or `dynamodb` app managers.
-   **Shared Resources:** Adapters (Redis, NATS) become critical shared resources. Ensure they are also scaled and monitored appropriately.
-   **Rate Limiting:** When scaling, consider if your rate limiter (`memory`, `redis`, `redis_cluster`) needs to be cluster-aware. A `redis` or `redis_cluster` based rate limiter would provide global rate limiting across all instances. An in-memory rate limiter would be per-instance.
-   **Metrics and Logging:** Aggregate logs and metrics from all instances into a centralized system for easier monitoring and troubleshooting. Sockudo's Prometheus metrics support can be very helpful here.
-   **Deployment:** Use containerization (e.g., Docker) and orchestration (e.g., Kubernetes) for easier management of a scaled Sockudo deployment.

By choosing the right adapter and setting up appropriate load balancing, you can effectively scale your Sockudo deployment to handle a large number of users and ensure high availability.
