# Cache Configuration

Sockudo utilizes caching for various purposes, such as storing presence channel member data, app configurations (by the App Manager), and potentially other internal data to improve performance and reduce load on backend systems.

Global cache settings are configured under the `cache` object in your `config.json`.

## Main Cache Settings

* **JSON Key (Parent)**: `cache`

### `cache.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `CACHE_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies the backend driver for the primary caching system.
* **Default Value**: `"memory"`
* **Possible Values**:
    * `"memory"`: In-memory cache. Fast but data is lost on restart and not shared between instances.
    * `"redis"`: Uses a Redis server for caching.
    * `"redis-cluster"`: Uses a Redis Cluster for caching.
    * `"none"`: Disables caching. (Note: `options.rs` shows `CacheDriver::None`, so the string value would be `"none"`).
* **Example (`config.json`)**:
    ```json
    {
      "cache": {
        "driver": "redis",
        "redis": {
          "prefix": "sockudo_main_cache:"
        }
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export CACHE_DRIVER=redis
    ```

## Memory Cache Options (`cache.memory`)

These settings are applicable if `cache.driver` is set to `"memory"`.

* **JSON Key (Parent Object)**: `cache.memory`

### `cache.memory.ttl`
* **JSON Key**: `ttl`
* **Type**: `integer` (u64, seconds)
* **Description**: Default time-to-live for items in the memory cache.
* **Default Value**: `300` (5 minutes)

### `cache.memory.cleanup_interval`
* **JSON Key**: `cleanup_interval`
* **Type**: `integer` (u64, seconds)
* **Description**: How often the memory cache should run its cleanup process to evict expired items.
* **Default Value**: `60` (1 minute)

### `cache.memory.max_capacity`
* **JSON Key**: `max_capacity`
* **Type**: `integer` (u64)
* **Description**: The maximum number of items the memory cache can hold.
* **Default Value**: `10000`
* **Example (`config.json`)**:
    ```json
    {
      "cache": {
        "driver": "memory",
        "memory": {
          "ttl": 600,
          "cleanup_interval": 120,
          "max_capacity": 20000
        }
      }
    }
    ```

## Redis Cache Options (`cache.redis`)

These settings are applicable if `cache.driver` is set to `"redis"` or `"redis-cluster"`. For Redis Cluster, these settings might be used in conjunction with specific cluster node configurations if the client library supports it, or the global `database.redis` settings are used if `url_override` is not provided.

* **JSON Key (Parent Object)**: `cache.redis`

### `cache.redis.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `CACHE_REDIS_PREFIX`
* **Type**: `string` (optional)
* **Description**: A prefix for all Redis keys used by this cache instance. Helps avoid key collisions.
* **Default Value**: `"sockudo_cache:"`

### `cache.redis.url_override`
* **JSON Key**: `url_override`
* **Environment Variable**: (Can be part of `REDIS_URL` if `CACHE_DRIVER` is redis, or a specific `CACHE_REDIS_URL`)
* **Type**: `string` (optional)
* **Description**: A specific Redis connection URL to use for this cache instance, overriding the global `database.redis.url` if provided.
    Format: `redis://[username:password@]host:port[/db]`
* **Default Value**: `null` (None). If not set, it will likely use the global Redis configuration from `database.redis`.

### `cache.redis.cluster_mode`
* **JSON Key**: `cluster_mode`
* **Type**: `boolean`
* **Description**: Indicates if the Redis connection for caching should operate in cluster mode. This is relevant if `cache.driver` is `"redis"` but you are connecting to a Redis Cluster. If `cache.driver` is `"redis-cluster"`, this is implicitly true.
* **Default Value**: `false`
* **Example (`config.json` for Redis Cache)**:
    ```json
    {
      "cache": {
        "driver": "redis",
        "redis": {
          "prefix": "myapp_cache:",
          "url_override": "redis://my-cache-redis:6379/1"
        }
      },
      // Ensure database.redis is configured if url_override is not used
      "database": {
        "redis": {
          "host": "global-redis-host", // Used if url_override is null
          "port": 6379
        }
      }
    }
    ```
* **Example (`config.json` for Redis Cluster Cache)**:
    ```json
    {
      "cache": {
        "driver": "redis-cluster", // Explicitly use the redis-cluster driver
        "redis": { // Common redis settings like prefix can still apply
          "prefix": "myapp_cluster_cache:"
          // url_override might not be used here; cluster nodes are typically
          // configured in the global database.redis.cluster_nodes
        }
      },
      "database": {
        "redis": {
          "cluster_nodes": [
            {"host": "node1.mycluster.com", "port": 7000},
            {"host": "node2.mycluster.com", "port": 7001}
          ]
        }
      }
    }
    ```

**Note on Redis Connections for Cache:**
If `cache.redis.url_override` is not specified, the cache manager will typically fall back to using the global Redis connection settings defined under `database.redis`. Ensure these are correctly configured if you intend to use Redis for caching without an override URL.
See [Database Configuration (Other Options)](./other-options.md#database-configuration-database) for `database.redis` details.
