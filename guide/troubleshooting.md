# Troubleshooting Guide

This guide provides solutions and diagnostic steps for common issues you might encounter while setting up or running Sockudo.

## Enabling Debug Mode

The first step in troubleshooting is often to get more detailed logs from Sockudo. You can enable debug mode in two ways:

1.  **Via `config.json`**:
    Set the `debug` option to `true`:
    ```json
    {
      "debug": true
      // ... other configurations
    }
    ```

2.  **Via Environment Variable**:
    Set the `DEBUG` environment variable:
    ```bash
    export DEBUG=true
    ./target/release/sockudo # Or however you run Sockudo
    ```
    When debug mode is enabled, Sockudo will output more verbose logs, which can provide valuable clues about the problem.

## Viewing Logs

How you view logs depends on how you're running Sockudo:

* **Directly in Terminal**: Logs will be printed to `stdout` and `stderr`.
* **`systemd` Service**: If running as a `systemd` service (as recommended for production), use `journalctl`:
    ```bash
    sudo journalctl -u sockudo.service          # View all logs for the service
    sudo journalctl -u sockudo.service -f       # Follow new logs in real-time
    sudo journalctl -u sockudo.service -n 100   # View the last 100 log lines
    sudo journalctl -u sockudo.service --since "1 hour ago" # Logs from the last hour
    ```
* **Docker**: If running in Docker:
    ```bash
    docker logs <container_name_or_id>
    docker logs -f <container_name_or_id> # Follow logs
    ```

Look for error messages (often prefixed with `ERROR` or `WARN`), stack traces, or any unusual activity.

## Common Issues and Solutions

### 1. Connection Refused / Server Not Reachable

* **Symptom**: Clients (Laravel Echo, Pusher JS) cannot connect to Sockudo. Browsers show "connection refused" or timeout errors.
* **Possible Causes & Solutions**:
    * **Sockudo Not Running**: Ensure the Sockudo process is actually running. Check with `ps aux | grep sockudo` or `systemctl status sockudo.service`.
    * **Incorrect Host/Port**:
        * Verify Sockudo's configured `host` and `port` in `config.json` or environment variables.
        * Ensure your client configuration (e.g., Laravel Echo's `wsHost`, `wsPort`) matches exactly.
    * **Firewall**: A firewall on the server (e.g., `ufw`, `firewalld`) or a cloud provider security group might be blocking incoming connections to Sockudo's port.
    * **Reverse Proxy Issues**: If using Nginx, Apache, Caddy, or another reverse proxy:
        * Ensure the proxy is correctly configured to forward WebSocket connections (headers like `Upgrade` and `Connection`).
        * Verify the proxy is passing requests to the correct internal Sockudo host and port.
        * Check the reverse proxy's logs for errors.
    * **SSL/TLS Mismatch**:
        * If Sockudo is configured for SSL (`ssl.enabled: true`), clients must connect using `wss://` (and `forceTLS: true` or equivalent in client config).
        * If SSL is not enabled in Sockudo (or SSL is terminated at the proxy), clients must use `ws://` to connect to the proxy (which then might connect to Sockudo via HTTP).
    * **Listening on Wrong Interface**: If `host` is set to `127.0.0.1` (localhost), Sockudo will only accept connections from the server itself. For external access, use `0.0.0.0` or the server's specific public/private IP address that clients can reach.

### 2. Authentication Failures (4xx Errors for Private/Presence Channels)

* **Symptom**: Clients fail to subscribe to private or presence channels. The browser console might show 401, 403, or other 4xx errors during the authentication request to your application's auth endpoint. Sockudo logs might show authentication errors related to channel authorization.
* **Possible Causes & Solutions**:
    * **Incorrect App Key/Secret**:
        * Verify that the `app_id`, `key`, and `secret` in your client-side application (e.g., Laravel `.env` file for `VITE_PUSHER_APP_KEY`, `VITE_PUSHER_APP_SECRET`) exactly match an application configured in Sockudo (either in `app_manager.array.apps` or your app manager's database).
        * Secrets are case-sensitive.
    * **Auth Endpoint Issues (for private/presence channels)**:
        * Ensure your application's authentication endpoint (e.g., `/broadcasting/auth` in Laravel) is correctly implemented and accessible.
        * This endpoint must validate the user and return a valid JSON response with the signed channel data, as per Pusher's protocol.
        * Check logs of your auth endpoint application (e.g., Laravel logs) for errors.
    * **CORS Issues with Auth Endpoint**: If your auth endpoint is on a different domain/port than your main web application, ensure CORS is correctly configured on the auth endpoint server to allow requests from your web app's origin, including credentials.
    * **Timestamp/Signature Mismatch**: Pusher protocol authentication is sensitive to timing and signature generation. Ensure your server-side auth logic (e.g., Laravel Broadcasting) is correctly signing the auth response using the correct app secret.
    * **Sockudo User Authentication Timeout**: Check `user_authentication_timeout` in Sockudo's config. If your auth endpoint is slow, this might be too short.

### 3. Redis Connection Issues

* **Symptom**: Sockudo fails to start or logs errors related to Redis if configured to use Redis for Adapter, Cache, Queue, or Rate Limiter.
* **Possible Causes & Solutions**:
    * **Redis Server Not Running/Reachable**:
        * Ensure your Redis server is running: `redis-cli ping` (should return `PONG`).
        * Verify the Redis host, port, password (if any), and database number in Sockudo's configuration (`database.redis`, or specific overrides like `adapter.redis.redis_pub_options.url`, `cache.redis.url_override`, etc.).
        * Check network connectivity and firewalls between Sockudo and Redis server(s).
    * **Incorrect Redis URL/Configuration**: Double-check connection strings and options. For Sentinel, ensure master name and sentinel nodes are correct. For Cluster, ensure all seed nodes are listed.
    * **Authentication Failure**: If Redis requires a password, ensure it's correctly configured in Sockudo.

### 4. NATS Connection Issues

* **Symptom**: Sockudo fails to start or logs errors related to NATS if the NATS adapter is configured.
* **Possible Causes & Solutions**:
    * **NATS Server Not Running/Reachable**: Verify NATS server(s) are operational and accessible from where Sockudo is running.
    * **Incorrect NATS URLs/Credentials**: Check `adapter.nats.servers`, `username`, `password`, `token` in Sockudo's config.

### 5. SQS Queue Issues

* **Symptom**: Webhooks or other queued tasks are not being processed; errors related to SQS in logs.
* **Possible Causes & Solutions**:
    * **AWS Credentials**: Ensure Sockudo has valid AWS credentials with permissions to access the SQS queue. Check IAM roles, environment variables (`AWS_ACCESS_KEY_ID`, etc.), or shared credential files.
    * **Incorrect SQS Configuration**: Verify `queue.sqs.region`, `queue_url_prefix` (or full queue URL if derived), FIFO settings, etc.
    * **Network Connectivity**: Ensure Sockudo can reach the SQS endpoints. If using a VPC, check VPC endpoints, NAT gateways, and security groups.

### 6. High Resource Usage (CPU/Memory)

* **Symptom**: Sockudo process consumes excessive CPU or memory.
* **Possible Causes & Solutions**:
    * **High Connection/Message Volume**: If legitimate, you may need to scale vertically (more powerful server) or horizontally (more Sockudo instances with a suitable adapter).
    * **Inefficient Client Behavior**: Clients sending too many messages or frequently connecting/disconnecting.
    * **Memory Leaks (Rare)**: If memory usage continuously grows without stabilizing over a long period despite constant load, this could indicate a bug. Report this with detailed logs, metrics, and reproduction steps.
    * **Debug Mode**: Running in debug mode (`"debug": true`) can increase resource usage. Disable it in production.
    * **Adapter/Backend Issues**: Problems with connected services (Redis, NATS, databases) can sometimes cause Sockudo to work harder (e.g., retrying operations, holding resources).
    * **Use Profiling Tools**: For deep dives, Rust profiling tools (like `perf`, `flamegraph`) can help identify performance bottlenecks in the code itself if you suspect an issue within Sockudo.

### 7. Webhook Failures

* **Symptom**: Your application's webhook endpoint is not receiving events from Sockudo, or Sockudo logs errors related to webhooks.
* **Possible Causes & Solutions**:
    * **Incorrect Webhook URL/Lambda Config**: Verify the `url` or `lambda` configuration in the app's webhook settings.
    * **Webhook Endpoint Issues**:
        * Ensure your endpoint is publicly accessible (or accessible from Sockudo's network/VPC).
        * Test your endpoint independently (e.g., with `curl` or Postman) to ensure it responds with a `2xx` status code quickly.
        * Check logs on your webhook receiver application.
    * **Queue System Issues**: If webhooks use a queue (Redis/SQS), check the queue system's health and Sockudo's queue configuration. Are workers processing the queue?
    * **Batching Configuration**: If batching is enabled, events are sent periodically or when a batch is full. There might be a slight delay.
    * **Event Type Mismatch**: Ensure the `event_types` in the webhook configuration match the events you expect.
    * **Firewall/Network Issues**: Ensure Sockudo can make outbound requests to your webhook URL or AWS Lambda endpoints.

## Getting Help

If you're unable to resolve an issue:

1.  **Check Sockudo's GitHub Issues**: See if someone else has reported a similar problem: [https://github.com/RustNSparks/sockudo/issues](https://github.com/RustNSparks/sockudo/issues)
2.  **Open a New Issue**: If your problem is new, create a detailed issue on GitHub. Include:
    * Sockudo version (e.g., commit hash if building from source).
    * Relevant parts of your `config.json` (censor secrets).
    * Detailed logs (especially with debug mode enabled).
    * Steps to reproduce the issue.
    * Your environment (OS, Rust version, how you're deploying - Docker, systemd, etc.).
    * Client-side library and version (e.g., Laravel Echo, PusherJS).

Providing as much information as possible will help the maintainers and community assist you.
