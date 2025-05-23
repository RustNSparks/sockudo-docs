# Getting Started with Sockudo

Welcome to Sockudo! This guide will walk you through the initial steps to get Sockudo up and running on your system. We'll cover prerequisites, installation, and how to start the server.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Rust**: Version 1.85 or newer. You can install Rust via [rustup](https://rustup.rs/).
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```
    If you already have Rust, ensure it's up to date:
    ```bash
    rustup update
    ```
* **Git**: For cloning the repository.
* **(Optional) Redis**: Required if you plan to use the Redis adapter for scaling or caching. Sockudo can run without it using the `local` adapter or `memory` cache/app manager.
* **(Optional) NATS Server**: Required if you plan to use the NATS adapter.
* **(Optional) MySQL/PostgreSQL/DynamoDB**: Required if you plan to use the respective App Manager drivers.

## Installation

Follow these steps to download and build Sockudo:

1.  **Clone the Repository**

    Open your terminal and clone the Sockudo repository from GitHub:
    ```bash
    git clone https://github.com/RustNSparks/sockudo.git
    cd sockudo
    ```

2.  **Build the Project**

    Navigate into the cloned directory and use Cargo (Rust's package manager and build tool) to compile the project. For a production-ready build, use the `--release` flag:
    ```bash
    cargo build --release
    ```
    This command will compile Sockudo and place the executable in the `target/release/` directory. If you omit `--release`, a debug build will be created in `target/debug/`.

Prebuilt binaries are also available for download on the [Releases page](https://github.com/RustNSparks/sockudo/releases)
## Running Sockudo

Once the build is complete, you can start the Sockudo server.

1.  **Start the Server (Default Configuration)**

    To run Sockudo with its default settings (which typically use in-memory stores and listen on port 6001), execute the compiled binary:
    ```bash
    ./target/release/sockudo
    ```
    If you built in debug mode, the path would be `./target/debug/sockudo`.

    You should see log output in your terminal indicating that the server has started, similar to this:
    ```
    INFO sockudo::main: Starting Sockudo server initialization process...
    INFO sockudo::main: Final configuration loaded. Initializing server components.
    INFO sockudo::main: Initializing Sockudo server with new configuration...
    INFO sockudo::main: AppManager initialized with driver: Memory
    INFO sockudo::main: Adapter initialized with driver: Local
    INFO sockudo::main: CacheManager initialized with driver: Memory
    INFO sockudo::main: Metrics are disabled in configuration
    INFO sockudo::main: HTTP API RateLimiter initialized (enabled: true) with driver: Memory
    INFO sockudo::main: Queue driver set to None, queue manager will be disabled.
    INFO sockudo::main: Webhook integration initialized successfully
    INFO sockudo::main: Server init sequence started.
    INFO sockudo::main: No apps found in configuration, registering demo app
    INFO sockudo::main: Successfully registered demo app
    INFO sockudo::main: Server has 1 registered apps:
    INFO sockudo::main: - App: id=demo-app, key=demo-key, enabled=true
    INFO sockudo::main: Server init sequence completed.
    INFO sockudo::main: Starting Sockudo server services...
    INFO sockudo::main: SSL is not enabled, starting HTTP server
    INFO sockudo::main: HTTP server listening on 0.0.0.0:6001
    ```

    By default, Sockudo will:
    * Listen on `0.0.0.0:6001`.
    * Use the `local` adapter (no external message broker needed for single-instance operation).
    * Use the `memory` app manager (apps are configured in-memory or via a default demo app).
    * Use the `memory` cache.
    * Metrics and advanced queueing might be disabled or use memory drivers by default.

2.  **Verifying the Server**

    You can quickly check if the server is running by navigating to the health check endpoint (if enabled and on the default port):
    * HTTP API health/usage: `http://localhost:6001/usage` (this might require an app_id or specific setup depending on your default app configuration)
    * WebSocket connections will be made to `/app/{appKey}`.

## Basic Configuration

Sockudo can be configured in two primary ways:

1.  **Using a `config.json` file**: Create a `config.json` file in the root directory of the project (or specify a path using the `--config` flag).
2.  **Using Environment Variables**: Many configuration options can be set via environment variables.

For a minimal setup, the default configuration is often sufficient for initial testing.

**Example `config.json` (Minimal):**
If you want to quickly define an application, create a `src/config.json` (as per default path in `main.rs`) or specify with `./target/release/sockudo --config=./myconfig.json`:
```json
{
  "app_manager": {
    "driver": "memory",
    "array": {
      "apps": [
        {
          "id": "my-first-app",
          "key": "app-key-123",
          "secret": "app-secret-xyz",
          "enable_client_messages": true,
          "enabled": true,
          "max_connections": 100,
          "max_client_events_per_second": 10
        }
      ]
    }
  },
  "port": 6001,
  "debug": true
}
```
For detailed information on all configuration options and how to use environment variables, please refer to the Configuration Guide.Next StepsCongratulations! You've successfully installed and run Sockudo. Here's what you might want to do next:Configure Sockudo: Dive deep into all the available configuration options to tailor Sockudo to your needs.Integrate with Laravel Echo: Learn how to connect your Laravel application to Sockudo.Use with Pusher JS: See examples of how to use the standard Pusher JavaScript client.Explore API Endpoints: Understand the HTTP and WebSocket APIs Sockudo provides.
