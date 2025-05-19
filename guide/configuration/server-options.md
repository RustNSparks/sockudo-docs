# Server Options Configuration

This section details general server-level configurations for Sockudo, primarily found directly under the root of the `ServerOptions` struct or within simple sub-structs like `SslConfig`.

These settings control fundamental aspects such as network binding, debugging, and SSL/TLS.

## Core Server Settings

These options are typically at the top level of your `config.json`.

### `debug`
* **JSON Key**: `debug`
* **Environment Variable**: `DEBUG` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: Enables or disables debug mode. When enabled, more verbose logging and potentially other debugging features are active.
* **Default Value**: `false`
* **Example (`config.json`)**:
    ```json
    {
      "debug": true
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export DEBUG=true
    ```

### `host`
* **JSON Key**: `host`
* **Environment Variable**: `HOST`
* **Type**: `string`
* **Description**: The IP address the Sockudo server will listen on. Use `0.0.0.0` to listen on all available network interfaces or a specific IP address.
* **Default Value**: `"0.0.0.0"`
* **Example (`config.json`)**:
    ```json
    {
      "host": "127.0.0.1"
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export HOST="127.0.0.1"
    ```

### `port`
* **JSON Key**: `port`
* **Environment Variable**: `PORT`
* **Type**: `integer` (u16)
* **Description**: The port number the Sockudo server will listen on for WebSocket and HTTP API connections.
* **Default Value**: `6001`
* **Example (`config.json`)**:
    ```json
    {
      "port": 6002
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export PORT=6002
    ```

### `mode`
* **JSON Key**: `mode`
* **Environment Variable**: `APP_MODE` (Note: This is a common pattern, verify exact ENV var if used)
* **Type**: `string`
* **Description**: Specifies the application mode, e.g., "production", "development". This can be used by Sockudo or extensions for mode-specific behavior.
* **Default Value**: `"production"`
* **Example (`config.json`)**:
    ```json
    {
      "mode": "development"
    }
    ```

### `path_prefix`
* **JSON Key**: `path_prefix`
* **Environment Variable**: `PATH_PREFIX`
* **Type**: `string`
* **Description**: A prefix for all HTTP and WebSocket paths. For example, if set to `/ws`, the WebSocket endpoint would be `/ws/app/{appKey}`.
* **Default Value**: `/`
* **Example (`config.json`)**:
    ```json
    {
      "path_prefix": "/sockudo_api"
    }
    ```

### `shutdown_grace_period`
* **JSON Key**: `shutdown_grace_period`
* **Environment Variable**: `SHUTDOWN_GRACE_PERIOD`
* **Type**: `integer` (u64, seconds)
* **Description**: The number of seconds Sockudo will wait for existing connections to close gracefully during shutdown before forcing termination.
* **Default Value**: `10`
* **Example (`config.json`)**:
    ```json
    {
      "shutdown_grace_period": 30
    }
    ```

### `user_authentication_timeout`
* **JSON Key**: `user_authentication_timeout`
* **Environment Variable**: `USER_AUTHENTICATION_TIMEOUT`
* **Type**: `integer` (u64, seconds)
* **Description**: Timeout in seconds for user authentication requests, typically for private/presence channels.
* **Default Value**: `3600` (1 hour)
* **Example (`config.json`)**:
    ```json
    {
      "user_authentication_timeout": 60
    }
    ```

### `websocket_max_payload_kb`
* **JSON Key**: `websocket_max_payload_kb`
* **Environment Variable**: `WEBSOCKET_MAX_PAYLOAD_KB`
* **Type**: `integer` (u32, kilobytes)
* **Description**: The maximum allowed size for a single WebSocket message payload in kilobytes.
* **Default Value**: `64`
* **Example (`config.json`)**:
    ```json
    {
      "websocket_max_payload_kb": 128
    }
    ```

## SSL/TLS Configuration (`ssl`)

These options are configured under the `ssl` object in your `config.json`.

* **JSON Key (Parent)**: `ssl`

### `ssl.enabled`
* **JSON Key**: `enabled`
* **Environment Variable**: `SSL_ENABLED` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: Enables or disables SSL/TLS for WebSocket (WSS) and HTTP API (HTTPS) connections.
* **Default Value**: `false`
* **Example (`config.json`)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "/path/to/your/cert.pem",
        "key_path": "/path/to/your/key.pem"
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export SSL_ENABLED=true
    export SSL_CERT_PATH="/path/to/your/cert.pem"
    export SSL_KEY_PATH="/path/to/your/key.pem"
    ```

### `ssl.cert_path`
* **JSON Key**: `cert_path`
* **Environment Variable**: `SSL_CERT_PATH`
* **Type**: `string`
* **Description**: Path to your SSL certificate file (e.g., PEM format). Required if `ssl.enabled` is `true`.
* **Default Value**: `""`
* **Example (`config.json`)**: See `ssl.enabled`

### `ssl.key_path`
* **JSON Key**: `key_path`
* **Environment Variable**: `SSL_KEY_PATH`
* **Type**: `string`
* **Description**: Path to your SSL private key file. Required if `ssl.enabled` is `true`.
* **Default Value**: `""`
* **Example (`config.json`)**: See `ssl.enabled`

### `ssl.passphrase`
* **JSON Key**: `passphrase`
* **Environment Variable**: `SSL_PASSPHRASE`
* **Type**: `string` (optional)
* **Description**: Passphrase for your SSL private key, if it's encrypted.
* **Default Value**: `null` (None)
* **Example (`config.json`)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "...",
        "key_path": "...",
        "passphrase": "yourSecretPassphrase"
      }
    }
    ```

### `ssl.ca_path`
* **JSON Key**: `ca_path`
* **Environment Variable**: `SSL_CA_PATH`
* **Type**: `string` (optional)
* **Description**: Path to your SSL Certificate Authority (CA) bundle file. Useful for client certificate authentication or custom CAs.
* **Default Value**: `null` (None)

### `ssl.redirect_http`
* **JSON Key**: `redirect_http`
* **Environment Variable**: `SSL_REDIRECT_HTTP` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: If `ssl.enabled` is `true`, this option will start an additional HTTP server (on `ssl.http_port`) that automatically redirects all incoming HTTP requests to HTTPS.
* **Default Value**: `false`
* **Example (`config.json`)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "...",
        "key_path": "...",
        "redirect_http": true,
        "http_port": 8080
      }
    }
    ```

### `ssl.http_port`
* **JSON Key**: `http_port`
* **Environment Variable**: `SSL_HTTP_PORT`
* **Type**: `integer` (u16, optional)
* **Description**: The port for the HTTP redirect server if `ssl.redirect_http` is `true`.
* **Default Value**: `80`
* **Example (`config.json`)**: See `ssl.redirect_http`

## Instance Configuration (`instance`)

Settings related to the specific instance of the Sockudo server.

* **JSON Key (Parent)**: `instance`

### `instance.process_id`
* **JSON Key**: `process_id`
* **Environment Variable**: `PROCESS_ID` (or often auto-generated)
* **Type**: `string`
* **Description**: A unique identifier for this Sockudo process. Useful in clustered environments for identifying nodes.
* **Default Value**: A randomly generated UUID v4 string (e.g., `"a1b2c3d4-e5f6-7890-1234-567890abcdef"`)
* **Example (`config.json`)**:
    ```json
    {
      "instance": {
        "process_id": "sockudo-node-1"
      }
    }
    ```
