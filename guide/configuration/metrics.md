# guide/configuration/metrics.md

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
* **Default Value**: `true`

### `metrics.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `METRICS_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies the metrics system driver to use.
* **Default Value**: `"prometheus"`
* **Possible Values**:
  * `"prometheus"`: Exposes metrics in a Prometheus-compatible format.

### `metrics.host`
* **JSON Key**: `host`
* **Environment Variable**: `METRICS_HOST`
* **Type**: `string`
* **Description**: The IP address the metrics server will listen on. Use `0.0.0.0` to listen on all available network interfaces.
* **Default Value**: `"0.0.0.0"`

### `metrics.port`
* **JSON Key**: `port`
* **Environment Variable**: `METRICS_PORT`
* **Type**: `integer` (u16)
* **Description**: The port number the metrics server will listen on. This is typically different from the main application port.
* **Default Value**: `9601`

**Example (`config.json`)**:
```json
{
  "metrics": {
    "enabled": true,
    "driver": "prometheus",
    "host": "0.0.0.0",
    "port": 9601,
    "prometheus": {
      "prefix": "sockudo_"
    }
  }
}
```

**Example (Environment Variables)**:
```bash
export METRICS_ENABLED=true
export METRICS_HOST="0.0.0.0"
export METRICS_PORT=9601
```

## Prometheus Configuration (`metrics.prometheus`)

These settings are applicable if `metrics.driver` is set to `"prometheus"`.

* **JSON Key (Parent Object)**: `metrics.prometheus`

### `metrics.prometheus.prefix`
* **JSON Key**: `prefix`
* **Environment Variable**: `PROMETHEUS_METRICS_PREFIX`
* **Type**: `string`
* **Description**: A prefix that will be added to all metric names exposed by Sockudo. Useful for namespacing in a shared Prometheus instance.
* **Default Value**: `"sockudo_"`

**Example (`config.json`)**:
```json
{
  "metrics": {
    "enabled": true,
    "driver": "prometheus",
    "host": "0.0.0.0",
    "port": 9601,
    "prometheus": {
      "prefix": "my_company_sockudo_"
    }
  }
}
```

**Environment Variables:**
```bash
METRICS_ENABLED=true
METRICS_DRIVER=prometheus
METRICS_HOST="0.0.0.0"
METRICS_PORT=9601
PROMETHEUS_METRICS_PREFIX="my_company_sockudo_"
```

## Available Metrics

Sockudo exposes a comprehensive set of metrics for monitoring various aspects of the server's performance:

### Connection Metrics
- **`sockudo_active_connections`**: Current number of active WebSocket connections
- **`sockudo_total_connections`**: Total number of WebSocket connections established
- **`sockudo_connection_errors_total`**: Total number of connection errors
- **`sockudo_connections_per_app`**: Active connections per application

### Message Metrics
- **`sockudo_messages_sent_total`**: Total number of messages sent by the server
- **`sockudo_messages_received_total`**: Total number of messages received from clients
- **`sockudo_client_events_total`**: Total number of client events processed
- **`sockudo_broadcast_messages_total`**: Total number of messages broadcast to channels

### HTTP API Metrics
- **`sockudo_http_requests_total`**: Total number of HTTP API requests
- **`sockudo_http_request_duration_seconds`**: HTTP request duration histogram
- **`sockudo_http_response_size_bytes`**: HTTP response size histogram

### Channel Metrics
- **`sockudo_active_channels`**: Current number of active channels
- **`sockudo_channel_subscriptions_total`**: Total number of channel subscriptions
- **`sockudo_channel_unsubscriptions_total`**: Total number of channel unsubscriptions
- **`sockudo_presence_members`**: Current number of members in presence channels

### Rate Limiting Metrics
- **`sockudo_rate_limit_triggered_total`**: Number of times rate limits were triggered
- **`sockudo_rate_limit_checks_total`**: Total number of rate limit checks performed

### Queue Metrics (if queue is enabled)
- **`sockudo_queue_jobs_processed_total`**: Total number of queue jobs processed
- **`sockudo_queue_jobs_failed_total`**: Total number of failed queue jobs
- **`sockudo_queue_active_jobs`**: Current number of jobs in the queue
- **`sockudo_queue_job_duration_seconds`**: Queue job processing time histogram

### Webhook Metrics
- **`sockudo_webhooks_sent_total`**: Total number of webhooks sent
- **`sockudo_webhooks_failed_total`**: Total number of failed webhooks
- **`sockudo_webhook_duration_seconds`**: Webhook request duration histogram

### Cache Metrics
- **`sockudo_cache_hits_total`**: Total number of cache hits
- **`sockudo_cache_misses_total`**: Total number of cache misses
- **`sockudo_cache_operations_total`**: Total number of cache operations
- **`sockudo_cache_memory_usage_bytes`**: Current cache memory usage

### Adapter Metrics
- **`sockudo_adapter_operations_total`**: Total number of adapter operations
- **`sockudo_adapter_errors_total`**: Total number of adapter errors
- **`sockudo_adapter_latency_seconds`**: Adapter operation latency histogram

## Accessing Metrics

When enabled, metrics are available at the following endpoint:

`http://<metrics.host>:<metrics.port>/metrics`

For example, with default settings: `http://localhost:9601/metrics`

### Example Metrics Output

```
# HELP sockudo_active_connections Current number of active connections
# TYPE sockudo_active_connections gauge
sockudo_active_connections{app_id="demo-app"} 42

# HELP sockudo_messages_sent_total Total messages sent
# TYPE sockudo_messages_sent_total counter
sockudo_messages_sent_total{app_id="demo-app",channel_type="public"} 1234

# HELP sockudo_http_request_duration_seconds HTTP request duration
# TYPE sockudo_http_request_duration_seconds histogram
sockudo_http_request_duration_seconds_bucket{method="POST",endpoint="/events",le="0.1"} 100
sockudo_http_request_duration_seconds_bucket{method="POST",endpoint="/events",le="0.5"} 150
sockudo_http_request_duration_seconds_bucket{method="POST",endpoint="/events",le="1.0"} 200
sockudo_http_request_duration_seconds_sum{method="POST",endpoint="/events"} 45.2
sockudo_http_request_duration_seconds_count{method="POST",endpoint="/events"} 200
```

## Security Considerations

### Network Access
The metrics endpoint should be secured and only accessible to monitoring systems:

```json
{
  "metrics": {
    "host": "127.0.0.1",  // Only local access
    "port": 9601
  }
}
```

### Firewall Configuration
Configure your firewall to restrict access to the metrics port:

```bash
# Allow only monitoring server
iptables -A INPUT -p tcp --dport 9601 -s 10.0.1.100 -j ACCEPT
iptables -A INPUT -p tcp --dport 9601 -j DROP
```

### Reverse Proxy Protection
Use a reverse proxy to add authentication:

```nginx
server {
    listen 9602;
    location /metrics {
        auth_basic "Metrics";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://localhost:9601/metrics;
    }
}
```

## Integration with Monitoring Systems

### Prometheus Configuration

Add a scrape job to your `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sockudo'
    static_configs:
      - targets: ['localhost:9601']
        labels:
          instance: 'sockudo-1'
          environment: 'production'
    scrape_interval: 15s
    metrics_path: /metrics
    scheme: http
```

For multiple Sockudo instances:

```yaml
scrape_configs:
  - job_name: 'sockudo'
    static_configs:
      - targets: 
          - 'sockudo-1.example.com:9601'
          - 'sockudo-2.example.com:9601'
          - 'sockudo-3.example.com:9601'
        labels:
          environment: 'production'
    scrape_interval: 15s
    metrics_path: /metrics
```

### Kubernetes Service Discovery

```yaml
scrape_configs:
  - job_name: 'sockudo'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: sockudo
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
```

### Docker Compose with Prometheus

```yaml
version: '3.8'
services:
  sockudo:
    image: sockudo/sockudo:latest
    ports:
      - "6001:6001"
      - "9601:9601"
    environment:
      - METRICS_ENABLED=true
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=9601"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
```

## Grafana Dashboard

### Key Panels for Sockudo Dashboard

1. **Connection Overview**
  - Active connections gauge
  - Connection rate graph
  - Connections per app

2. **Message Throughput**
  - Messages sent/received rate
  - Client events rate
  - Broadcast message rate

3. **HTTP API Performance**
  - Request rate
  - Response time percentiles
  - Error rate

4. **Channel Activity**
  - Active channels
  - Subscription/unsubscription rates
  - Presence channel members

5. **System Health**
  - Rate limit triggers
  - Queue depth (if using queues)
  - Cache hit rate
  - Webhook success rate

### Example Grafana Queries

```promql
# Active connections per app
sockudo_active_connections

# Message rate (5-minute average)
rate(sockudo_messages_sent_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(sockudo_http_request_duration_seconds_bucket[5m]))

# Error rate percentage
rate(sockudo_http_requests_total{status=~"5.."}[5m]) / rate(sockudo_http_requests_total[5m]) * 100

# Cache hit rate
rate(sockudo_cache_hits_total[5m]) / (rate(sockudo_cache_hits_total[5m]) + rate(sockudo_cache_misses_total[5m])) * 100
```

## Alerting Rules

### Prometheus Alerting Rules

```yaml
groups:
  - name: sockudo_alerts
    rules:
      - alert: SockudoHighErrorRate
        expr: rate(sockudo_http_requests_total{status=~"5.."}[5m]) / rate(sockudo_http_requests_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on Sockudo instance {{ $labels.instance }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: SockudoHighConnections
        expr: sockudo_active_connections > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High connection count on {{ $labels.instance }}"
          description: "Active connections: {{ $value }}"

      - alert: SockudoInstanceDown
        expr: up{job="sockudo"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Sockudo instance down"
          description: "Instance {{ $labels.instance }} is down"

      - alert: SockudoHighLatency
        expr: histogram_quantile(0.95, rate(sockudo_http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on Sockudo"
          description: "95th percentile latency is {{ $value }}s"

      - alert: SockudoQueueBacklog
        expr: sockudo_queue_active_jobs > 1000
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High queue backlog"
          description: "Queue has {{ $value }} pending jobs"
```

## Performance Impact

### Metrics Collection Overhead
- **CPU**: Minimal overhead (< 1% typically)
- **Memory**: Small memory footprint for metric storage
- **Network**: Metrics endpoint only accessed when scraped

### Optimization Tips
1. **Adjust scrape interval** based on your needs (15s-60s typical)
2. **Use recording rules** for complex queries
3. **Monitor metrics cardinality** to avoid high-cardinality labels
4. **Configure appropriate retention** for historical data

## Troubleshooting

### Common Issues

#### Metrics Endpoint Not Accessible
1. Check if metrics are enabled: `"enabled": true`
2. Verify host and port configuration
3. Check firewall rules
4. Test endpoint: `curl http://localhost:9601/metrics`

#### No Metrics Data
1. Verify Sockudo is receiving traffic
2. Check metric prefix configuration
3. Ensure Prometheus is scraping correctly
4. Check Sockudo logs for metric errors

#### High Cardinality Issues
1. Monitor number of unique label combinations
2. Avoid user IDs or session IDs as labels
3. Use histogram buckets appropriately
4. Consider metric sampling for high-volume metrics

### Debug Commands

```bash
# Check if metrics endpoint is working
curl http://localhost:9601/metrics | head -20

# Check specific metrics
curl http://localhost:9601/metrics | grep sockudo_active_connections

# Verify Prometheus scraping
curl http://prometheus:9090/api/v1/targets

# Check metrics in Prometheus
curl 'http://prometheus:9090/api/v1/query?query=sockudo_active_connections'
```

## Best Practices

### Metrics Design
1. **Use consistent naming** conventions
2. **Include relevant labels** (app_id, instance, etc.)
3. **Avoid high-cardinality labels**
4. **Use appropriate metric types** (counter, gauge, histogram)

### Monitoring Strategy
1. **Monitor key business metrics** (connections, messages)
2. **Set up meaningful alerts** with appropriate thresholds
3. **Use dashboards** for operational visibility
4. **Regular review** of metrics and alerts

### Security
1. **Restrict metrics endpoint access**
2. **Use authentication** for sensitive environments
3. **Monitor metrics access** logs
4. **Regular security updates** for monitoring stack

The metrics system provides valuable insights into Sockudo's performance and health, enabling proactive monitoring and troubleshooting of your real-time messaging infrastructure.