# Other Configuration Options

This section covers various other configuration areas within Sockudo's `ServerOptions` that control aspects like Cross-Origin Resource Sharing (CORS), channel and event limits, database connections (for App Managers or other features), and presence channel behavior.

## Channel Limits (`channel_limits`)

Settings that define limits related to channels.

* **JSON Key (Parent)**: `channel_limits`

### `channel_limits.max_name_length`
* **JSON Key**: `max_name_length`
* **Type**: `integer` (u32)
* **Description**: The maximum allowed length for a channel name.
* **Default Value**: `200`

### `channel_limits.cache_ttl`
* **JSON Key**: `cache_ttl`
* **Type**: `integer` (u64, seconds)
* **Description**: Time-to-live for cached channel-related information (e.g., existence, type).
* **Default Value**: `3600` (1 hour)
* **Example (`config.json`)**:
    ```json
    {
      "channel_limits": {
        "max_name_length": 150,
        "cache_ttl": 1800
      }
    }
    ```

## CORS Configuration (`cors`)

Controls Cross-Origin Resource Sharing for the HTTP API. This is important for allowing web applications hosted on different domains to interact with Sockudo's API.

* **JSON Key (Parent)**: `cors`

### `cors.credentials`
* **JSON Key**: `credentials`
* **Type**: `boolean`
* **Description**: Whether to allow credentials (e.g., cookies, authorization headers) to be included in cross-origin requests. If `cors.origin` is set to `["*"]`, this is typically forced to `false` by browsers/servers for security reasons, and Sockudo's `main.rs` reflects this logic.
* **Default Value**: `true`

### `cors.origin`
* **JSON Key**: `origin`
* **Type**: `array` of `string`
* **Description**: A list of allowed origins. An origin is a combination of scheme, hostname, and port.
    * Use `["*"]` to allow all origins (use with caution, especially if `credentials` is true, which Sockudo may override to false in this case).
    * Specify exact origins like `["https://example.com", "http://localhost:3000"]`.
* **Default Value**: `["*"]`

### `cors.methods`
* **JSON Key**: `methods`
* **Type**: `array` of `string`
* **Description**: A list of allowed HTTP methods for cross-origin requests (e.g., "GET", "POST", "OPTIONS").
* **Default Value**: `["GET", "POST", "OPTIONS"]`

### `cors.allowed_headers`
* **JSON Key**: `allowed_headers`
* **Type**: `array` of `string`
* **Description**: A list of allowed HTTP headers in cross-origin requests.
* **Default Value**: `["Authorization", "Content-Type", "X-Requested-With", "Accept"]`
* **Example (`config.json`)**:
    ```json
    {
      "cors": {
        "credentials": true,
        "origin": ["[https://app.example.com](https://app.example.com)", "[https://admin.example.com](https://admin.example.com)"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allowed_headers": ["Authorization", "Content-Type", "X-My-Custom-Header"]
      }
    }
    ```
**Note on CORS Logic (from `main.rs`):**
* If `origin` includes `"*"` or `"Any"`, `Access-Control-Allow-Origin` will be `*`. In this scenario, if `credentials` was `true`, Sockudo forces it to `false` to comply with CORS specifications.
* If `origin` is empty, CORS behavior might be restrictive.

## Database Configuration (`database`)

Centralized configuration for various database connections that Sockudo might use (e.g., for App Manager, Cache, Queue backends if not using specific overrides).

* **JSON Key (Parent)**: `database`

### MySQL Connection (`database.mysql`)
* **JSON Key (Parent Object)**: `database.mysql`
    * `host` (string): Default: `"localhost"`
    * `port` (integer, u16): Default: `3306`
    * `username` (string): Default: `"root"`
    * `password` (string): Default: `""`
    * `database` (string): Default: `"sockudo"`
    * `table_name` (string): Default table name for app manager if MySQL driver is used. Default: `"applications"`
    * `connection_pool_size` (integer, u32): Max connections in the pool. Default: `10`
    * `cache_ttl` (integer, u64, seconds): TTL for items cached by this DB connection (if it has its own cache layer). Default: `300`
    * `cache_cleanup_interval` (integer, u64, seconds): Default: `60`
    * `cache_max_capacity` (integer, u64): Default: `100`

### PostgreSQL Connection (`database.postgres`)
* **JSON Key (Parent Object)**: `database.postgres`
    * (Same fields and defaults as `database.mysql`, adjust port to `5432` if that's your PG default)

### Redis Connection (`database.redis`)
This is the global Redis configuration, used by Cache, Queue, Rate Limiter, or Adapters if they don't have a `url_override`.
* **JSON Key (Parent Object)**: `database.redis`
    * `host` (string): Default: `"127.0.0.1"`
    * `port` (integer, u16): Default: `6379`
    * `db` (integer, u32): Redis database number. Default: `0`
    * `username` (string, optional): Default: `null`
    * `password` (string, optional): Default: `null`
    * `key_prefix` (string): Global prefix for keys if this connection is used. Default: `"sockudo:"`
    * `sentinels` (array of `RedisSentinel` objects, optional): For Redis Sentinel setup. Default: `[]`
        * `RedisSentinel` object: `{ "host": "localhost", "port": 26379 }`
    * `sentinel_password` (string, optional): Password for connecting to Sentinels. Default: `null`
    * `name` (string): Master name for Sentinel. Default: `"mymaster"`
    * `cluster_nodes` (array of `ClusterNode` objects, optional): For Redis Cluster setup. Default: `[]`
        * `ClusterNode` object: `{ "host": "127.0.0.1", "port": 7000 }`

### DynamoDB Settings (`database.dynamodb`)
Used if `app_manager.driver` is `"dynamodb"`.
* **JSON Key (Parent Object)**: `database.dynamodb`
    * `region` (string): AWS Region. Default: `"us-east-1"`
    * `table_name` (string): DynamoDB table name. Default: `"sockudo-applications"`
    * `endpoint_url` (string, optional): For local testing (e.g., LocalStack). Default: `null`
    * `aws_access_key_id` (string, optional): Explicit AWS credentials. Default: `null` (uses SDK default chain)
    * `aws_secret_access_key` (string, optional): Default: `null`
    * `aws_profile_name` (string, optional): AWS profile name from shared credentials file. Default: `null`

* **Example (`config.json` for databases)**:
    ```json
    {
      "database": {
        "mysql": {
          "host": "db.example.com",
          "username": "sockudo_user",
          "password": "secure_password",
          "database": "sockudo_prod"
        },
        "redis": {
          "host": "redis.example.com",
          "port": 6379,
          "key_prefix": "prod_sockudo:"
        },
        "dynamodb": {
            "region": "eu-central-1",
            "table_name": "prod-sockudo-apps"
        }
      }
    }
    ```

## Database Pooling (`database_pooling`)

General settings for database connection pooling, if the specific database client supports it through these generic options.

* **JSON Key (Parent)**: `database_pooling`
* `enabled` (boolean): Default: `true`
* `min` (integer, u32): Minimum number of connections in the pool. Default: `2`
* `max` (integer, u32): Maximum number of connections in the pool. Default: `10`

## Event Limits (`event_limits`)

Defines various limits related to events published on channels.

* **JSON Key (Parent)**: `event_limits`
* `max_channels_at_once` (integer, u32): Max channels an event can be published to in a single API call. Default: `100`
* `max_name_length` (integer, u32): Max length for an event name. Default: `200`
* `max_payload_in_kb` (integer, u32): Max payload size for a single event in kilobytes. Default: `100`
* `max_batch_size` (integer, u32): Max number of events in a batch API call. Default: `10`
* **Example (`config.json`)**:
    ```json
    {
      "event_limits": {
        "max_payload_in_kb": 50,
        "max_batch_size": 5
      }
    }
    ```

## HTTP API Configuration (`http_api`)

Settings specific to the behavior of the HTTP API.

* **JSON Key (Parent)**: `http_api`

### `http_api.request_limit_in_mb`
* **JSON Key**: `request_limit_in_mb`
* **Type**: `integer` (u32)
* **Description**: Maximum request body size in megabytes for HTTP API endpoints.
* **Default Value**: `10`

### Traffic Acceptance (`http_api.accept_traffic`)
* **JSON Key (Parent Object)**: `http_api.accept_traffic`
    * `memory_threshold` (float, f64): A memory usage threshold (0.0 to 1.0). If system memory usage exceeds this, the server might start rejecting traffic. The exact implementation of how Sockudo measures/uses this would need to be checked. Default: `0.90` (90%)
* **Example (`config.json`)**:
    ```json
    {
      "http_api": {
        "request_limit_in_mb": 5,
        "accept_traffic": {
          "memory_threshold": 0.85
        }
      }
    }
    ```

## Presence Channel Configuration (`presence`)

Settings specific to presence channels.

* **JSON Key (Parent)**: `presence`
* `max_members_per_channel` (integer, u32): Maximum number of members allowed in a single presence channel. Default: `100`
* `max_member_size_in_kb` (integer, u32): Maximum size in kilobytes for the `user_info` data associated with a presence channel member. Default: `2`
* **Example (`config.json`)**:
    ```json
    {
      "presence": {
        "max_members_per_channel": 50,
        "max_member_size_in_kb": 1
      }
    }
    ```
