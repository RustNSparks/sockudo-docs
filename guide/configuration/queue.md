# Queue Configuration

Sockudo can utilize a queueing system for background processing tasks, most notably for handling webhook dispatches. This allows Sockudo to send webhooks asynchronously without blocking the main application flow, improving responsiveness and reliability.

Queue configuration is managed under the `queue` object in your `config.json`.

## Main Queue Settings

* **JSON Key (Parent)**: `queue`

### `queue.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `QUEUE_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies the backend driver for the queueing system.
* **Default Value**: `"redis"` (as per `options.rs`, but `main.rs` logic might default to `None` if setup fails)
* **Possible Values**:
    * `"memory"`: In-memory queue. Simple for development but not persistent or shared across instances.
    * `"redis"`: Uses a Redis server as a message queue.
    * `"redis-cluster"`: Uses a Redis Cluster as a message queue for high availability and scalability.
    * `"sqs"`: Uses Amazon Simple Queue Service (SQS).
    * `"none"`: Disables the queueing system. Webhooks might be sent synchronously or not at all if the queue is required.
* **Example (`config.json`)**:
    ```json
    {
      "queue": {
        "driver": "redis-cluster",
        "redis_cluster": {
          // Redis Cluster specific config here
        }
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export QUEUE_DRIVER=redis-cluster
    ```

## Redis Queue Options (`queue.redis`)

These settings are applicable if `queue.driver` is set to `"redis"`.

* **JSON Key (Parent Object)**: `queue.redis`

### `queue.redis.concurrency`
* **JSON Key**: `concurrency`
* **Type**: `integer` (u32)
* **Description**: The number of concurrent workers processing jobs from this Redis queue.
* **Default Value**: `5`
* **Example (`config.json`)**:
    ```json
    {
      "queue": {
        "driver": "redis",
        "redis": {
          "concurrency": 10,
          "prefix": "sockudo_jobs:",
          "url_override": "redis://my-queue-redis:6379/2"
        }
      }
    }
    ```

### `queue.redis.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `QUEUE_REDIS_PREFIX`
* **Type**: `string` (optional)
* **Description**: A prefix for Redis keys used by the queue (e.g., list names).
* **Default Value**: `"sockudo_queue:"`

### `queue.redis.url_override`
* **JSON Key**: `url_override`
* **Environment Variable**: (Can be part of `REDIS_URL` if `QUEUE_DRIVER` is redis, or a specific `QUEUE_REDIS_URL`)
* **Type**: `string` (optional)
* **Description**: A specific Redis connection URL to use for the queue, overriding the global `database.redis.url` if provided.
    Format: `redis://[username:password@]host:port[/db]`
* **Default Value**: `null` (None). If not set, it will likely use the global Redis configuration from `database.redis`.

### `queue.redis.cluster_mode`
* **JSON Key**: `cluster_mode`
* **Type**: `boolean`
* **Description**: Indicates if the Redis connection for the queue should operate in cluster mode. This is relevant if `queue.driver` is `"redis"` but you are connecting to a Redis Cluster.
* **Default Value**: `false`

**Note on Redis Connections for Queue:**
If `queue.redis.url_override` is not specified, the queue manager will typically fall back to using the global Redis connection settings defined under `database.redis`. Ensure these are correctly configured if you intend to use Redis for queuing without an override URL.
See [Database Configuration (Other Options)](./other-options.md#database-configuration-database) for `database.redis` details.

## Redis Cluster Queue Options (`queue.redis_cluster`)

These settings are applicable if `queue.driver` is set to `"redis-cluster"`.

* **JSON Key (Parent Object)**: `queue.redis_cluster`

### `queue.redis_cluster.concurrency`
* **JSON Key**: `concurrency`
* **Environment Variable**: `REDIS_CLUSTER_QUEUE_CONCURRENCY`
* **Type**: `integer` (u32)
* **Description**: The number of concurrent workers processing jobs from this Redis Cluster queue.
* **Default Value**: `5`

### `queue.redis_cluster.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `REDIS_CLUSTER_QUEUE_PREFIX`
* **Type**: `string` (optional)
* **Description**: A prefix for Redis keys used by the queue (e.g., list names) in the cluster.
* **Default Value**: `"sockudo_queue:"`

### `queue.redis_cluster.nodes`
* **JSON Key**: `nodes`
* **Environment Variable**: `REDIS_CLUSTER_NODES` (comma-separated list)
* **Type**: `array` of `string`
* **Description**: List of Redis cluster node URLs to connect to. The client will discover other nodes in the cluster automatically.
    Format: `["redis://host1:port1", "redis://host2:port2", ...]`
* **Default Value**: `["redis://127.0.0.1:7000", "redis://127.0.0.1:7001", "redis://127.0.0.1:7002"]`

### `queue.redis_cluster.request_timeout_ms`
* **JSON Key**: `request_timeout_ms`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Request timeout for Redis cluster operations in milliseconds.
* **Default Value**: `5000`

* **Example (`config.json` for Redis Cluster)**:
    ```json
    {
      "queue": {
        "driver": "redis-cluster",
        "redis_cluster": {
          "nodes": [
            "redis://redis-cluster-node-1:7000",
            "redis://redis-cluster-node-2:7000",
            "redis://redis-cluster-node-3:7000"
          ],
          "concurrency": 8,
          "prefix": "production_queue:",
          "request_timeout_ms": 10000
        }
      }
    }
    ```

* **Example (Environment Variables for Redis Cluster)**:
    ```bash
    export QUEUE_DRIVER=redis-cluster
    export REDIS_CLUSTER_NODES="redis://node1:7000,redis://node2:7000,redis://node3:7000"
    export REDIS_CLUSTER_QUEUE_CONCURRENCY=8
    export REDIS_CLUSTER_QUEUE_PREFIX="production_queue:"
    ```

**Note on Redis Cluster:**
When using Redis Cluster, ensure that:
1. Your Redis Cluster is properly configured and all nodes are accessible from your Sockudo instance.
2. The cluster has sufficient master nodes to handle the expected load.
3. Network connectivity between Sockudo and all cluster nodes is reliable.
4. Consider using consistent node URLs (avoid mixing IP addresses and hostnames) for better reliability.

## SQS Queue Options (`queue.sqs`)

These settings are applicable if `queue.driver` is set to `"sqs"`.

* **JSON Key (Parent Object)**: `queue.sqs`

### `queue.sqs.region`
* **JSON Key**: `region`
* **Environment Variable**: `AWS_REGION` or `SQS_REGION` (verify precedence)
* **Type**: `string`
* **Description**: The AWS region where your SQS queue is located (e.g., "us-east-1").
* **Default Value**: `"us-east-1"`

### `queue.sqs.queue_url_prefix`
* **JSON Key**: `queue_url_prefix`
* **Environment Variable**: `SQS_QUEUE_URL_PREFIX`
* **Type**: `string` (optional)
* **Description**: The prefix for your SQS queue URL. If your queue name is `my-sockudo-queue` and your account ID is `123456789012` in `us-east-1`, the full URL might be `https://sqs.us-east-1.amazonaws.com/123456789012/my-sockudo-queue`. The prefix could be `https://sqs.us-east-1.amazonaws.com/123456789012/`. Sockudo will likely append the queue name (often derived or fixed).
* **Default Value**: `null` (None)

### `queue.sqs.visibility_timeout`
* **JSON Key**: `visibility_timeout`
* **Type**: `integer` (i32, seconds)
* **Description**: The duration (in seconds) that a message received from a queue will be invisible to other consumers.
* **Default Value**: `30`

### `queue.sqs.endpoint_url`
* **JSON Key**: `endpoint_url`
* **Environment Variable**: `SQS_ENDPOINT_URL`
* **Type**: `string` (optional)
* **Description**: Custom SQS endpoint URL. Useful for testing with local SQS alternatives like LocalStack.
* **Default Value**: `null` (None)

### `queue.sqs.max_messages`
* **JSON Key**: `max_messages`
* **Type**: `integer` (i32)
* **Description**: The maximum number of messages to retrieve with each SQS receive message call (1-10).
* **Default Value**: `10`

### `queue.sqs.wait_time_seconds`
* **JSON Key**: `wait_time_seconds`
* **Type**: `integer` (i32, seconds)
* **Description**: The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. (Long polling).
* **Default Value**: `5`

### `queue.sqs.concurrency`
* **JSON Key**: `concurrency`
* **Type**: `integer` (u32)
* **Description**: The number of concurrent workers processing jobs from this SQS queue.
* **Default Value**: `5`

### `queue.sqs.fifo`
* **JSON Key**: `fifo`
* **Type**: `boolean`
* **Description**: Set to `true` if the SQS queue is a FIFO (First-In-First-Out) queue.
* **Default Value**: `false`

### `queue.sqs.message_group_id`
* **JSON Key**: `message_group_id`
* **Type**: `string` (optional)
* **Description**: The message group ID to use when sending messages to an SQS FIFO queue. Required if `fifo` is `true`.
* **Default Value**: `"default"`
* **Example (`config.json` for SQS)**:
    ```json
    {
      "queue": {
        "driver": "sqs",
        "sqs": {
          "region": "eu-west-1",
          "queue_url_prefix": "https://sqs.eu-west-1.amazonaws.com/YOUR_ACCOUNT_ID/", // Replace YOUR_ACCOUNT_ID
          // queue_name will likely be derived, e.g. "sockudo_webhooks_queue"
          "visibility_timeout": 60,
          "concurrency": 3,
          "fifo": false // Set to true if using a FIFO queue and provide message_group_id
          // "message_group_id": "sockudo-group" // If fifo: true
        }
      }
    }
    ```

**AWS Credentials for SQS:**
When using the SQS driver, Sockudo's AWS SDK will need credentials. These are typically sourced automatically by the SDK from standard locations:
1.  Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
2.  Shared credentials file (`~/.aws/credentials`).
3.  IAM roles for EC2 instances or ECS tasks.

Refer to the [AWS SDK documentation](https://docs.aws.amazon.com/sdk-for-rust/latest/dg/credentials.html) for more details on credential providers.

## Queue Driver Comparison

| Feature | Memory | Redis | Redis Cluster | SQS |
|---------|--------|-------|---------------|-----|
| **Persistence** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Multi-instance** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **High Availability** | ❌ No | ⚠️ Limited | ✅ Yes | ✅ Yes |
| **Scalability** | ❌ Limited | ⚠️ Vertical | ✅ Horizontal | ✅ Managed |
| **Cost** | ✅ Free | 💰 Hosting costs | 💰 Hosting costs | 💰 Per message |
| **Setup Complexity** | ✅ Simple | ⚠️ Moderate | ❌ Complex | ✅ Managed |
| **Best For** | Development | Single Redis instance | High availability | AWS-native apps |

Choose the queue driver that best fits your deployment requirements and infrastructure constraints.
