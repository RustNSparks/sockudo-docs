# Metrics Configuration

Sockudo can expose performance metrics that can be scraped by monitoring systems like Prometheus. This allows you to observe the server's behavior, track performance, and set up alerts.

Metrics configuration is managed under the `metrics` object in your `config.json`.

## Main Metrics Settings

* **JSON Key (Parent)**: `metrics`

### `metrics.enabled`
* **JSON Key**: `enabled`
* **Environment Variable**: `METRICS_ENABLED` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: Enables or disables the metrics exposition system. If disabled, the metrics endpoint will not be available.
* **Default Value**: `true` (as per `options.rs` default for `MetricsConfig`, though `main.rs` logic might disable if setup fails)
* **Example (`config.json`)**:
    ```json
    {
      "metrics": {
        "enabled": true,
        "driver": "prometheus",
        "host": "0.0.0.0",
        "port": 9601
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export METRICS_ENABLED=true
    ```

### `metrics.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `METRICS_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies the metrics system driver to use.
* **Default Value**: `"prometheus"`
* **Possible Values**:
    * `"prometheus"`: Exposes metrics in a Prometheus-compatible format.
* **Example (`config.json`)**: See `metrics.enabled`

### `metrics.host`
* **JSON Key**: `host`
* **Environment Variable**: `METRICS_HOST`
* **Type**: `string`
* **Description**: The IP address the metrics server will listen on. Use `0.0.0.0` to listen on all available network interfaces.
* **Default Value**: `"0.0.0.0"`
* **Example (`config.json`)**:
    ```json
    {
      "metrics": {
        "enabled": true,
        "host": "127.0.0.1", // Only accessible locally
        "port": 9601
      }
    }
    ```

### `metrics.port`
* **JSON Key**: `port`
* **Environment Variable**: `METRICS_PORT`
* **Type**: `integer` (u16)
* **Description**: The port number the metrics server will listen on. This is typically different from the main application port.
* **Default Value**: `9601`
* **Example (`config.json`)**: See `metrics.enabled`

## Prometheus Configuration (`metrics.prometheus`)

These settings are applicable if `metrics.driver` is set to `"prometheus"`.

* **JSON Key (Parent Object)**: `metrics.prometheus`

### `metrics.prometheus.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `PROMETHEUS_METRICS_PREFIX` (Verify exact ENV var if used)
* **Type**: `string`
* **Description**: A prefix that will be added to all metric names exposed by Sockudo. Useful for namespacing in a shared Prometheus instance.
* **Default Value**: `"sockudo_"`
* **Example (`config.json`)**:
    ```json
    {
      "metrics": {
        "enabled": true,
        "driver": "prometheus",
        "port": 9601,
        "prometheus": {
          "prefix": "my_company_sockudo_"
        }
      }
    }
    ```

## Accessing Metrics

When enabled, metrics are typically available at the following endpoint:

`http://<metrics.host>:<metrics.port>/metrics`

For example, with default settings: `http://localhost:9601/metrics`

Refer to the [Monitoring Guide](/guide/monitoring.md) for more details on what metrics are available and how to integrate with Prometheus.
