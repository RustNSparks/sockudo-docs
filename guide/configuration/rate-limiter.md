# Rate Limiter Configuration

Sockudo includes a rate limiting feature to protect your server from abuse and ensure fair usage. It can limit the number of requests from a single IP address to the HTTP API and the number of WebSocket connection attempts.

Rate limiter configuration is managed under the `rate_limiter` object in your `config.json`.

## Main Rate Limiter Settings

* **JSON Key (Parent)**: `rate_limiter`

### `rate_limiter.enabled`
* **JSON Key**: `enabled`
* **Environment Variable**: `RATE_LIMITER_ENABLED` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: Enables or disables the rate limiting feature globally.
* **Default Value**: `true`
* **Example (`config.json`)**:
    ```json
    {
      "rate_limiter": {
        "enabled": true,
        "driver": "memory"
        // ... other rate limiter settings
      }
    }
    ```

### `rate_limiter.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `RATE_LIMITER_DRIVER`
* **Type**: `enum` (string, uses `CacheDriver` enum values)
* **Description**: Specifies the backend driver for storing rate limit counters. This often uses a cache driver.
* **Default Value**: `"memory"`
* **Possible Values**:
    * `"memory"`: Uses an in-memory store. Suitable for single-instance deployments. Counts are not shared across instances.
    * `"redis"`: Uses a Redis server. Recommended for multi-instance deployments.
    * `"redis-cluster"`: Uses a Redis Cluster.
    * `"none"`: Effectively disables rate limiting by not having a persistent store (behavior might vary, but generally not recommended if `enabled` is true).
* **Example (`config.json`)**:
    ```json
    {
      "rate_limiter": {
        "enabled": true,
        "driver": "redis",
        "redis": {
          "prefix": "sockudo_rl:",
          "url_override": "redis://rate-limit-redis:6379/3"
        }
        // ... other rate limiter settings
      }
    }
    ```

## Rate Limit Definitions

Sockudo defines separate rate limits for different types of requests. These are configured using the `RateLimit` object structure.

**`RateLimit` Object Structure:**
* `max_requests` (integer, u32): Maximum number of requests allowed within the `window_seconds`.
* `window_seconds` (integer, u64): The time window in seconds during which `max_requests` are counted.
* `identifier` (string, optional): A unique name for this rate limit rule, mainly for logging or internal use. Default: `"default"`.
* `trust_hops` (integer, u32, optional): Number of hops (proxies) to trust when determining the client's IP address from headers like `X-Forwarded-For`. A value of `0` means the direct connecting IP is used. Default: `0`.

### `rate_limiter.api_rate_limit`
* **JSON Key**: `api_rate_limit`
* **Type**: `RateLimit` object
* **Description**: Configuration for rate limiting requests to the HTTP API endpoints.
* **Default Value**:
    ```json
    {
      "max_requests": 100,
      "window_seconds": 60,
      "identifier": "api",
      "trust_hops": 0
    }
    ```
* **Environment Variables (for API rate limit)**:
    * `RATE_LIMITER_API_MAX_REQUESTS`
    * `RATE_LIMITER_API_WINDOW_SECONDS`
    * `RATE_LIMITER_API_TRUST_HOPS`
* **Example (`config.json`)**:
    ```json
    {
      "rate_limiter": {
        "enabled": true,
        "driver": "memory",
        "api_rate_limit": {
          "max_requests": 200,
          "window_seconds": 60,
          "trust_hops": 1 // Trust one layer of proxy
        }
        // ... websocket_rate_limit and redis settings
      }
    }
    ```

### `rate_limiter.websocket_rate_limit`
* **JSON Key**: `websocket_rate_limit`
* **Type**: `RateLimit` object
* **Description**: Configuration for rate limiting new WebSocket connection attempts.
* **Default Value**:
    ```json
    {
      "max_requests": 20,
      "window_seconds": 60,
      "identifier": "websocket_connect",
      "trust_hops": 0
    }
    ```
* **Environment Variables (for WebSocket rate limit)**:
    * `RATE_LIMITER_WEBSOCKET_MAX_REQUESTS`
    * `RATE_LIMITER_WEBSOCKET_WINDOW_SECONDS`
    * `RATE_LIMITER_WEBSOCKET_TRUST_HOPS`
* **Example (`config.json`)**:
    ```json
    {
      "rate_limiter": {
        "enabled": true,
        "driver": "memory",
        "websocket_rate_limit": {
          "max_requests": 10,
          "window_seconds": 60
        }
        // ... api_rate_limit and redis settings
      }
    }
    ```

## Redis Backend for Rate Limiter (`rate_limiter.redis`)

These settings are applicable if `rate_limiter.driver` is set to `"redis"` or `"redis-cluster"`. This uses the same `RedisConfig` structure as the main cache.

* **JSON Key (Parent Object)**: `rate_limiter.redis`

### `rate_limiter.redis.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `RATE_LIMITER_REDIS_PREFIX`
* **Type**: `string` (optional)
* **Description**: A prefix for all Redis keys used by the rate limiter.
* **Default Value**: `"sockudo_rl:"`

### `rate_limiter.redis.url_override`
* **JSON Key**: `url_override`
* **Type**: `string` (optional)
* **Description**: A specific Redis connection URL for the rate limiter, overriding global `database.redis.url`.
* **Default Value**: `null` (None). Falls back to `database.redis` if not set.

### `rate_limiter.redis.cluster_mode`
* **JSON Key**: `cluster_mode`
* **Type**: `boolean`
* **Description**: Whether the Redis connection for rate limiting should use cluster mode.
* **Default Value**: `false`
* **Example (`config.json` with Redis for Rate Limiting)**:
    ```json
    {
      "rate_limiter": {
        "enabled": true,
        "driver": "redis",
        "api_rate_limit": { "max_requests": 500, "window_seconds": 60 },
        "websocket_rate_limit": { "max_requests": 30, "window_seconds": 60 },
        "redis": {
          "prefix": "myapp_rl:",
          "url_override": "redis://dedicated-redis-for-rl:6379/0"
        }
      },
      // Ensure database.redis is configured if url_override is not used by rate_limiter.redis
      "database": {
        "redis": {
          "host": "global-redis-host",
          "port": 6379
        }
      }
    }
    ```

**Note on Redis Connections for Rate Limiter:**
If `rate_limiter.redis.url_override` is not specified, the rate limiter will typically use the global Redis connection settings from `database.redis`. Ensure these are configured if you use Redis for rate limiting without an override. See [Database Configuration (Other Options)](./other-options.md#database-configuration-database).
