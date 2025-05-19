# Adapter Configuration

The Adapter in Sockudo is a crucial component responsible for managing WebSocket connections and broadcasting messages between different server instances in a scaled environment. It allows Sockudo to scale horizontally.

Configuration for the adapter is managed under the `adapter` object in your `config.json` file.

## Main Adapter Settings

* **JSON Key (Parent)**: `adapter`

### `adapter.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `ADAPTER_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies which adapter driver to use. This determines how Sockudo handles message passing in a multi-node setup.
* **Default Value**: `"local"`
* **Possible Values**:
    * `"local"`: For single-instance deployments. No external message broker is used.
    * `"redis"`: Uses a Redis server (or Sentinel setup) as a message broker.
    * `"redis-cluster"`: Uses a Redis Cluster as a message broker.
    * `"nats"`: Uses a NATS server as a message broker.
* **Example (`config.json`)**:
    ```json
    {
      "adapter": {
        "driver": "redis",
        "redis": {
          // Redis specific config here
        }
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export ADAPTER_DRIVER=redis
    ```

## Redis Adapter (`adapter.redis`)

These settings are applicable if `adapter.driver` is set to `"redis"`.

* **JSON Key (Parent Object)**: `adapter.redis`

### `adapter.redis.requests_timeout`
* **JSON Key**: `requests_timeout`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Timeout for requests made by the adapter, such as fetching data or acknowledgments.
* **Default Value**: `5000` (5 seconds)

### `adapter.redis.prefix`
* **JSON Key**: `prefix`
* **Type**: `string`
* **Description**: A prefix for all Redis keys used by this adapter. Helps avoid key collisions if the Redis instance is shared.
* **Default Value**: `"sockudo_adapter:"`

### `adapter.redis.redis_pub_options` and `adapter.redis.redis_sub_options`
* **JSON Key**: `redis_pub_options`, `redis_sub_options`
* **Type**: `object` (map of string to JSON value)
* **Description**: Connection options for the Redis publisher and subscriber clients. Typically, you'd provide a `url` here. These options are passed to the underlying Redis client library.
    * `url`: The Redis connection URL (e.g., `"redis://127.0.0.1:6379"` or `"redis://:password@host:port/db"`).
    * You can also configure Sentinel connections here if your Redis client library supports it through options.
* **Default Value**: Empty map `{}`. (Note: `REDIS_URL` env var can populate this if not set, see `main.rs`)
* **Example (`config.json`)**:
    ```json
    {
      "adapter": {
        "driver": "redis",
        "redis": {
          "prefix": "myapp_adapter:",
          "redis_pub_options": {
            "url": "redis://127.0.0.1:6379/0"
          },
          "redis_sub_options": {
            "url": "redis://127.0.0.1:6379/0"
          }
        }
      }
    }
    ```
    If using Redis Sentinel:
    ```json
    {
      "adapter": {
        "driver": "redis",
        "redis": {
          "redis_pub_options": {
            "sentinel": {
                "master_name": "mymaster",
                "hosts": [
                    {"host": "127.0.0.1", "port": 26379},
                    {"host": "127.0.0.1", "port": 26380}
                ],
                "password": "yourSentinelPassword" // Optional
            },
            "password": "yourRedisPassword" // Optional, if master requires auth
          },
          // ... similar for redis_sub_options
        }
      }
    }
    ```
    *Note: The exact structure for Sentinel options might depend on the underlying Rust Redis client library used by Sockudo. Refer to its documentation for precise formatting if the above example doesn't work directly.*

### `adapter.redis.cluster_mode`
* **JSON Key**: `cluster_mode`
* **Type**: `boolean`
* **Description**: Indicates if the Redis connection should operate in cluster mode. **Note:** For dedicated Redis Cluster support, prefer using the `"redis-cluster"` driver. This option might be for specific single-node client libraries that can talk to a cluster.
* **Default Value**: `false`

## Redis Cluster Adapter (`adapter.cluster` or `adapter.redis_cluster`)

The `options.rs` file shows `adapter.cluster` for `RedisClusterAdapterConfig`. Ensure your JSON reflects the correct key if it's `redis_cluster` in practice for consistency. Assuming `adapter.cluster` as per `options.rs`:

These settings are applicable if `adapter.driver` is set to `"redis-cluster"`.

* **JSON Key (Parent Object)**: `adapter.cluster` (as per `AdapterConfig` struct in `options.rs` which has a field `cluster: RedisClusterAdapterConfig`)

### `adapter.cluster.nodes`
* **JSON Key**: `nodes`
* **Type**: `array` of `string`
* **Description**: A list of seed node URLs for the Redis Cluster (e.g., `"redis://127.0.0.1:7000"`).
* **Default Value**: `[]` (empty array)
* **Example (`config.json`)**:
    ```json
    {
      "adapter": {
        "driver": "redis-cluster",
        "cluster": {
          "nodes": [
            "redis://10.0.1.1:7000",
            "redis://10.0.1.2:7001",
            "redis://10.0.1.3:7002"
          ],
          "prefix": "myapp_cluster_adapter:"
        }
      }
    }
    ```

### `adapter.cluster.prefix`
* **JSON Key**: `prefix`
* **Type**: `string`
* **Description**: A prefix for all Redis keys used by this adapter.
* **Default Value**: `"sockudo_redis_cluster_adapter:"` (derived from `REDIS_CLUSTER_DEFAULT_PREFIX`)

### `adapter.cluster.request_timeout_ms`
* **JSON Key**: `request_timeout_ms`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Timeout for requests made to the Redis Cluster.
* **Default Value**: `5000` (5 seconds)

### `adapter.cluster.use_connection_manager`
* **JSON Key**: `use_connection_manager`
* **Type**: `boolean`
* **Description**: Whether to use a connection manager for Redis Cluster connections.
* **Default Value**: `true`

## NATS Adapter (`adapter.nats`)

These settings are applicable if `adapter.driver` is set to `"nats"`.

* **JSON Key (Parent Object)**: `adapter.nats`

### `adapter.nats.servers`
* **JSON Key**: `servers`
* **Environment Variable**: `NATS_URL` (typically sets the first server if only one)
* **Type**: `array` of `string`
* **Description**: A list of NATS server URLs (e.g., `"nats://127.0.0.1:4222"`).
* **Default Value**: `["nats://localhost:4222"]`
* **Example (`config.json`)**:
    ```json
    {
      "adapter": {
        "driver": "nats",
        "nats": {
          "servers": [
            "nats://nats1.example.com:4222",
            "nats://nats2.example.com:4222"
          ],
          "prefix": "sockudo_prod_adapter"
        }
      }
    }
    ```
* **Example (Environment Variable for single server)**:
    ```bash
    export NATS_URL="nats://nats.example.com:4222"
    ```

### `adapter.nats.prefix`
* **JSON Key**: `prefix`
* **Type**: `string`
* **Description**: A prefix for NATS subjects used by the adapter.
* **Default Value**: `"sockudo_nats_adapter:"` (derived from `NATS_DEFAULT_PREFIX`)

### `adapter.nats.request_timeout_ms`
* **JSON Key**: `request_timeout_ms`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Timeout for NATS requests.
* **Default Value**: `5000` (5 seconds)

### `adapter.nats.username`
* **JSON Key**: `username`
* **Environment Variable**: `NATS_USERNAME`
* **Type**: `string` (optional)
* **Description**: Username for NATS authentication.
* **Default Value**: `null` (None)

### `adapter.nats.password`
* **JSON Key**: `password`
* **Environment Variable**: `NATS_PASSWORD`
* **Type**: `string` (optional)
* **Description**: Password for NATS authentication.
* **Default Value**: `null` (None)

### `adapter.nats.token`
* **JSON Key**: `token`
* **Environment Variable**: `NATS_TOKEN`
* **Type**: `string` (optional)
* **Description**: Token for NATS authentication.
* **Default Value**: `null` (None)

### `adapter.nats.connection_timeout_ms`
* **JSON Key**: `connection_timeout_ms`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Timeout for establishing a connection to the NATS server(s).
* **Default Value**: `5000` (5 seconds)

### `adapter.nats.nodes_number`
* **JSON Key**: `nodes_number`
* **Type**: `integer` (u32, optional)
* **Description**: An optional hint for the number of NATS nodes, which might be used for optimizations by the client.
* **Default Value**: `null` (None)
