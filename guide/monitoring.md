# Monitoring Sockudo

Monitoring your Sockudo server is crucial for understanding its performance, identifying bottlenecks, and ensuring its reliability in a production environment. Sockudo can expose metrics via a Prometheus-compatible endpoint.

## Enabling Metrics

First, ensure that metrics are enabled in your Sockudo configuration. This is typically done in your `config.json` or via environment variables.

```json
// config.json
{
  "metrics": {
    "enabled": true,
    "driver": "prometheus",
    "host": "0.0.0.0", // Or a specific IP for the metrics server
    "port": 9601,     // Default metrics port
    "prometheus": {
      "prefix": "sockudo_" // Default prefix for metric names
    }
  }
  // ... other configurations
}
```

Refer to the Metrics Configuration page for detailed options.

By default, if enabled, the metrics will be available at `http://<metrics_host>:<metrics_port>/metrics` (e.g., `http://localhost:9601/metrics`). This endpoint should be scraped by your Prometheus server.

## Key Metrics to Monitor

While the exact metrics exposed can vary based on Sockudo's version and specific configuration (especially with different adapters or features enabled), here are common types of metrics you should look for and aim to track:

### Active Connections:
- `sockudo_active_connections` (or similar): Total number of currently active WebSocket connections.
- Metrics per application ID (`app_id` label) might also be available.

### Message Throughput:
- `sockudo_messages_sent_total`: Total number of messages sent by the server to clients.
- `sockudo_messages_received_total`: Total number of messages received by the server from clients (e.g., client events).
- These might have labels for `app_id` or `channel`.

### API Usage (HTTP API):
- `sockudo_http_api_requests_total`: Counter for HTTP API requests, possibly with labels for `path`, `method`, and `status_code`.
- `sockudo_http_api_request_duration_seconds`: Histogram or summary of HTTP API request latencies.

### Channel Statistics:
- `sockudo_active_channels`: Total number of channels with at least one subscriber.
- `sockudo_channel_subscriptions_total`: Counter for channel subscription events.
- `sockudo_channel_unsubscriptions_total`: Counter for channel unsubscription events.

### Presence Channel Metrics:
- `sockudo_presence_channel_members`: Current number of members in presence channels, possibly per channel or app.

### Error Rates:
- `sockudo_errors_total`: Counter for various types of errors occurring in the server, possibly with a `type` or `source` label.
- `sockudo_websocket_errors_total`: Errors specific to WebSocket connections or protocol handling.
- `sockudo_authentication_failures_total`: Count of failed authentication attempts for private/presence channels.

### Adapter Performance (if exposed by the specific adapter):
- Metrics related to the chosen adapter (e.g., Redis/NATS publish/subscribe rates, error counts, latencies for adapter operations).

### Queue Performance (if webhooks or other features use it):
- `sockudo_queue_jobs_processed_total`: Number of queued jobs (e.g., webhooks) processed.
- `sockudo_queue_jobs_failed_total`: Number of failed jobs.
- `sockudo_queue_active_jobs`: Current number of jobs in the queue.
- `sockudo_queue_job_duration_seconds`: Histogram or summary of job processing times.

### Rate Limiting:
- `sockudo_rate_limit_triggered_total`: Counter for instances where rate limits were hit, possibly with labels for the type of limit (API, WebSocket).

### System Metrics (from the Rust process itself, often collected by node_exporter or similar OS-level monitoring):
- CPU Usage
- Memory Usage (RSS, VMS)
- File Descriptors (open/max)
- Network I/O (bytes sent/received, connections)

Always inspect the `/metrics` endpoint of your running Sockudo instance to see the exact list of available metrics and their names.

## Setting up Prometheus

Prometheus is an open-source monitoring and alerting toolkit. To scrape metrics from Sockudo:

1. **Install and Run Prometheus**: Follow the official Prometheus documentation.
2. **Configure Prometheus Scrape Job**:
   Add a scrape job to your `prometheus.yml` configuration file:

```yaml
global:
  scrape_interval: 15s # How frequently to scrape targets

scrape_configs:
  - job_name: 'sockudo'
    static_configs:
      - targets: ['localhost:9601'] # Replace with your Sockudo metrics endpoint(s)
        # If running multiple Sockudo instances, list them all:
        # targets: ['sockudo-node1.example.com:9601', 'sockudo-node2.example.com:9601']
    # If your metrics prefix in Sockudo config is not 'sockudo_',
    # you might want to use metric_relabel_configs to standardize or adjust.
    # For example, if Sockudo's prefix is 'my_company_sockudo_':
    # metric_relabel_configs:
    #   - source_labels: [__name__]
    #     regex: 'my_company_sockudo_(.*)'
    #     target_label: __name__
    #     replacement: 'sockudo_$1' # Optional: to normalize names in Prometheus
```

3. Restart Prometheus to apply the new configuration.

## Visualization with Grafana

Grafana is a popular open-source platform for monitoring and observability, often used with Prometheus.

1. **Install and Run Grafana**: Follow the official Grafana documentation.
2. **Add Prometheus as a Data Source**: Configure Grafana to connect to your Prometheus instance (usually at `http://prometheus_host:9090`).
3. **Create Dashboards**: Build dashboards in Grafana to visualize the Sockudo metrics scraped by Prometheus. You can create panels for:
   - Active Connections Over Time (per app, total)
   - Message Rates (Sent/Received)
   - API Request Latency Percentiles (e.g., p95, p99)
   - Error Rates (total, per error type)
   - Resource Usage (CPU/Memory, if collected separately via node_exporter)
   - Queue Depths and Throughput
   - Adapter-specific metrics

There might be community-contributed Grafana dashboards for Pusher-like servers or general WebSocket applications that you can adapt.

## Alerting

Configure alerting rules in Prometheus (using Alertmanager) or Grafana based on Sockudo metrics to get notified of critical issues, such as:

- High error rates (e.g., authentication failures, API errors).
- Drastic drops in active connections.
- High API or message processing latencies.
- Queue length growing excessively or jobs failing consistently.
- Server instances becoming unresponsive (Prometheus `up` metric for the scrape job).
- High resource utilization (CPU/memory saturation).

Example Prometheus alert rule (conceptual):

```yaml
groups:
- name: SockudoAlerts
  rules:
  - alert: SockudoHighErrorRate
    # Example: if the rate of sockudo_errors_total over 5m is significant
    expr: sum(rate(sockudo_errors_total{job="sockudo"}[5m])) > 10 # Adjust threshold
    for: 2m # Alert if condition holds for 2 minutes
    labels:
      severity: critical
    annotations:
      summary: High error rate on Sockudo (instance {{$labels.instance}})
      description: "Sockudo is experiencing a high rate of errors: {{$value}} errors/sec."

  - alert: SockudoInstanceDown
    expr: up{job="sockudo"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: Sockudo instance down (instance {{$labels.instance}})
```
