# Configuration Overview

Sockudo is designed to be highly configurable to suit various deployment needs, from small single-instance setups to large, horizontally-scaled clusters. You can configure Sockudo using a JSON file or environment variables.

## Configuration Methods

There are two primary ways to configure your Sockudo server:

1.  **JSON Configuration File**:
    * By default, Sockudo attempts to load a configuration file named `config.json` from the `src/` directory relative to where the binary is run (e.g., `src/config.json` if running from the project root).
    * You can specify a custom path to your configuration file using the `--config` command-line argument:
        ```bash
        ./target/release/sockudo --config=/path/to/your/custom-config.json
        ```
    * The JSON file structure directly mirrors the `ServerOptions` Rust struct found in `src/options.rs`.

2.  **Environment Variables**:
    * Most configuration options can be set using environment variables.
    * Environment variables typically override values set in the JSON configuration file.
    * The naming convention for environment variables usually follows `SCREAMING_SNAKE_CASE` derived from the JSON keys (e.g., `app_manager.driver` becomes `APP_MANAGER_DRIVER`). We will detail these mappings in the specific configuration sections.

## Configuration Precedence

Sockudo applies configuration in the following order of precedence (lower numbers are overridden by higher numbers):

1.  **Default Values**: Hardcoded default values within the `ServerOptions` struct (see `src/options.rs`).
2.  **JSON Configuration File**: Values loaded from the specified JSON file.
3.  **Environment Variables**: Values set through environment variables.

This means an environment variable will always take precedence over a value set in the `config.json` file, which in turn takes precedence over the compiled-in defaults.

## Main Configuration Sections

The configuration is broken down into several key areas, each handling a specific aspect of the server:

* **[Server Options](./configuration/server-options.md)**: General server settings like host, port, debug mode, and SSL.
* **[Adapter](./configuration/adapter.md)**: Configures how Sockudo communicates and scales across multiple instances (e.g., Local, Redis, NATS).
* **[App Manager](./configuration/app-manager.md)**: Manages your applications (credentials, settings) using backends like Memory, MySQL, or DynamoDB.
* **[Cache](./configuration/cache.md)**: Settings for caching mechanisms (e.g., Memory, Redis) to improve performance.
* **[Queue](./configuration/queue.md)**: Configuration for background job processing and message queuing (e.g., Memory, Redis, SQS), often used by webhooks.
* **[Metrics](./configuration/metrics.md)**: Enables and configures performance metrics exposure (e.g., Prometheus).
* **[Rate Limiter](./configuration/rate-limiter.md)**: Protects your server from abuse by limiting request rates.
* **[Webhooks](./configuration/webhooks.md)**: Configuration for sending event notifications to your application.
* **[Other Options](./configuration/other-options.md)**: Includes settings for CORS, channel limits, event limits, HTTP API behavior, and more.

Navigate to the respective sections to learn about the specific options available for each component. Always refer to the `src/options.rs` file for the most up-to-date and complete list of structures and default values.
