# Cluster Configuration

Sockudo includes settings for an internal clustering mechanism, defined by the `ClusterConfig` structure in `src/options.rs`. This configuration appears to facilitate node discovery and coordination among Sockudo instances, potentially for features like master election or maintaining a consistent view of the cluster state.

This internal clustering is distinct from the horizontal scaling provided by **Adapters** (like Redis or NATS), although they might complement each other. The adapter handles message broadcasting for WebSockets, while this cluster configuration might be for inter-node operational communication.

Cluster settings are configured under the `cluster` object in your `config.json`.

## Cluster Settings (`cluster`)

* **JSON Key (Parent)**: `cluster`

### `cluster.hostname`
* **JSON Key**: `hostname`
* **Environment Variable**: `CLUSTER_HOSTNAME` (Verify specific ENV var)
* **Type**: `string`
* **Description**: The hostname or IP address that this node should advertise to other nodes in the cluster.
* **Default Value**: `"localhost"`

### `cluster.hello_interval`
* **JSON Key**: `hello_interval`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Interval at which this node sends "hello" or heartbeat messages to discover or maintain connections with other cluster nodes.
* **Default Value**: `5000` (5 seconds)

### `cluster.check_interval`
* **JSON Key**: `check_interval`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Interval at which this node checks the status of other known nodes in the cluster.
* **Default Value**: `10000` (10 seconds)

### `cluster.node_timeout`
* **JSON Key**: `node_timeout`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Duration after which a node is considered timed out or unreachable if no communication is received from it.
* **Default Value**: `30000` (30 seconds)

### `cluster.master_timeout`
* **JSON Key**: `master_timeout`
* **Type**: `integer` (u64, milliseconds)
* **Description**: Timeout related to master node election or a master node's validity, if a master/slave architecture is used within the cluster.
* **Default Value**: `60000` (60 seconds)

### `cluster.port`
* **JSON Key**: `port`
* **Environment Variable**: `CLUSTER_PORT` (Verify specific ENV var)
* **Type**: `integer` (u16)
* **Description**: The port number this Sockudo node will use for its internal cluster communication. This should be different from the main application port and metrics port.
* **Default Value**: `6002`

### `cluster.prefix`
* **JSON Key**: `prefix`
* **Type**: `string`
* **Description**: A prefix used for any communication channels or keys related to this internal clustering mechanism (e.g., if it uses a shared backend like Redis for discovery).
* **Default Value**: `"sockudo_cluster:"`

### `cluster.ignore_process`
* **JSON Key**: `ignore_process`
* **Type**: `boolean`
* **Description**: If `true`, this node might ignore its own process in cluster operations or discovery, potentially to avoid self-connection or self-election in certain scenarios.
* **Default Value**: `false`

### `cluster.broadcast`
* **JSON Key**: `broadcast`
* **Type**: `string`
* **Description**: An identifier (e.g., a topic or channel name) used for broadcasting messages to all nodes in the cluster.
* **Default Value**: `"cluster:broadcast"`

### `cluster.unicast`
* **JSON Key**: `unicast`
* **Type**: `string` (optional)
* **Description**: An identifier or pattern for sending messages to a specific, single node in the cluster.
* **Default Value**: `"cluster:unicast"`

### `cluster.multicast`
* **JSON Key**: `multicast`
* **Type**: `string` (optional)
* **Description**: An identifier or pattern for sending messages to a group of nodes (a subset of the cluster).
* **Default Value**: `"cluster:multicast"`

* **Example (`config.json`)**:
    ```json
    {
      "cluster": {
        "hostname": "node1.internal.example.com",
        "port": 7001,
        "hello_interval": 3000,
        "prefix": "my_app_cluster:",
        "broadcast": "myapp_cluster_bcast"
      }
    }
    ```

**Note on Usage:**
The exact behavior and necessity of these cluster settings depend on Sockudo's internal implementation. If you are running a single Sockudo instance, these settings might not have a significant impact. For multi-node deployments, understanding how this internal clustering interacts with your chosen **Adapter** (e.g., Redis, NATS) is important. The adapter typically handles the primary task of message relay for WebSockets across instances. This cluster configuration might be for auxiliary coordination. Consult further project documentation or source code if advanced cluster tuning is required.
