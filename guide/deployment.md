# Deployment Guide

This guide provides recommendations and strategies for deploying your Sockudo server to a production environment.

## Building for Production

Always compile Sockudo in release mode for production deployments to ensure optimal performance and smaller binary size:

```bash
cargo build --release
```

The executable will be located at `target/release/sockudo`.

## Running as a Service

For long-running applications like Sockudo, it's essential to run it as a system service. This ensures it starts automatically on boot and restarts if it crashes. Here's an example using systemd, common on many Linux distributions.

### Create a systemd service file:

Create a file named `sockudo.service` in `/etc/systemd/system/`:

```
[Unit]
Description=Sockudo WebSocket Server
After=network.target
# Add dependencies like redis.service or nats.service if Sockudo depends on them at startup
# Wants=redis.service
# After=redis.service

[Service]
Type=simple
User=sockudo_user # Create a dedicated user for Sockudo
Group=sockudo_group # Create a dedicated group
WorkingDirectory=/opt/sockudo # Or wherever you deploy Sockudo
ExecStart=/opt/sockudo/target/release/sockudo --config=/opt/sockudo/config.json
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sockudo

# Environment variables can be set here or in a separate EnvironmentFile
# Environment="PORT=6001"
# Environment="ADAPTER_DRIVER=redis"
# Environment="REDIS_URL=redis://127.0.0.1:6379"
# EnvironmentFile=/etc/sockudo/sockudo.env

[Install]
WantedBy=multi-user.target
```

### Create User and Directory (if not exists):

```bash
sudo groupadd sockudo_group
sudo useradd -r -g sockudo_group -d /opt/sockudo -s /sbin/nologin sockudo_user
sudo mkdir -p /opt/sockudo
# Copy your sockudo binary and config.json to /opt/sockudo/
# sudo cp target/release/sockudo /opt/sockudo/
# sudo cp config.json /opt/sockudo/ # Or your production config
# sudo chown -R sockudo_user:sockudo_group /opt/sockudo
# sudo chmod +x /opt/sockudo/sockudo
```

If using an EnvironmentFile, create `/etc/sockudo/sockudo.env` and set appropriate permissions (e.g., `sudo chown sockudo_user:sockudo_group /etc/sockudo/sockudo.env` and `sudo chmod 640 /etc/sockudo/sockudo.env`).

### Enable and Start the Service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable sockudo.service
sudo systemctl start sockudo.service
```

### Check Status and Logs:

```bash
sudo systemctl status sockudo.service
sudo journalctl -u sockudo -f # View logs
```

## Containerization (Docker)

Running Sockudo in a Docker container is a popular deployment method.

### Create a Dockerfile:

```dockerfile
# Stage 1: Build the application
FROM rust:1.85 AS builder
# Or a more recent stable Rust version like rust:1.78
WORKDIR /usr/src/sockudo
COPY . .
# Consider using cargo-chef for optimized Docker layer caching if build times are an issue
RUN cargo build --release

# Stage 2: Create the runtime image
FROM debian:bullseye-slim
# Or FROM alpine for a smaller image, but may require different dependencies for ca-certificates or other runtime needs (e.g., musl vs glibc)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd --system sockudo_group && useradd --system --no-log-init -g sockudo_group sockudo_user

WORKDIR /opt/sockudo
COPY --from=builder /usr/src/sockudo/target/release/sockudo .
# Copy your default config.json if you want it baked into the image,
# but it's generally better to mount it or use environment variables.
# COPY config.json.production ./config.json

# Ensure the binary is executable
RUN chmod +x ./sockudo

# Change ownership to the non-root user
# This step might be redundant if WORKDIR is created after USER, but good for clarity
RUN chown -R sockudo_user:sockudo_group /opt/sockudo

USER sockudo_user

# Expose the default Sockudo port and metrics port
EXPOSE 6001
EXPOSE 9601 # If metrics are enabled

# Default command (can be overridden)
# Ensure config.json is present at this path in the container (e.g., mounted as a volume) or configure via ENV vars
CMD ["./sockudo", "--config=./config.json"]
```

### Build and Run the Docker Image:

```bash
docker build -t sockudo-server .

# To run, mounting a config file and mapping ports:
docker run -d --name my-sockudo-instance \
  -p 6001:6001 \
  -p 9601:9601 \
  -v $(pwd)/config.production.json:/opt/sockudo/config.json:ro \
  --restart unless-stopped \
  sockudo-server

# To run with environment variables (example):
# docker run -d --name my-sockudo-instance \
#   -p 6001:6001 \
#   -e PORT=6001 \
#   -e ADAPTER_DRIVER=redis \
#   -e REDIS_URL="redis://your-redis-host:6379" \
#   --restart unless-stopped \
#   sockudo-server
```

## Reverse Proxy (Nginx Example)

It's highly recommended to run Sockudo behind a reverse proxy like Nginx, Apache, Caddy, or HAProxy. This allows you to:

- Handle SSL/TLS termination.
- Serve static content (if any, though Sockudo is primarily an API/WebSocket server).
- Implement load balancing for multiple Sockudo instances.
- Provide an additional security layer (e.g., rate limiting at the edge, WAF).
- Manage HTTP headers and caching policies.

### Nginx Configuration Example:

This example assumes Nginx is handling SSL and proxying to Sockudo running on localhost:6001.

```nginx
# /etc/nginx/sites-available/yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Add www if applicable
    # For Certbot SSL renewal
    location ~ /.well-known/acme-challenge/ {
        allow all;
        root /var/www/html; # Or your certbot webroot
    }
    location / {
        return 301 https://$host$request_uri; # Redirect all HTTP to HTTPS
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration - Use strong parameters
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # Recommended: ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf; # From Certbot
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # From Certbot

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # add_header X-Frame-Options DENY;
    # add_header X-Content-Type-Options nosniff;
    # add_header Content-Security-Policy "default-src 'self'; ..."; # Adjust as needed

    location / { # Or your specific path_prefix if configured in Sockudo (e.g., /ws/)
        proxy_pass http://localhost:6001; # Assuming Sockudo runs on port 6001 locally
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade; # Essential for WebSockets
        proxy_set_header Connection "upgrade";   # Essential for WebSockets
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme; # Sockudo might use this
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        proxy_connect_timeout 60s;
        proxy_send_timeout 86400s; # Keep WebSocket connections alive (adjust as needed)
        proxy_read_timeout 86400s; # Keep WebSocket connections alive (adjust as needed)
        proxy_buffering off; # Can be beneficial for WebSockets to reduce latency
    }

    # If you have a separate metrics endpoint to expose (optional, secure appropriately)
    # location /sockudo-metrics {
    #    # Secure this endpoint, e.g., allow only specific IPs
    #    allow 192.168.1.100; # Your monitoring server IP
    #    allow 127.0.0.1;
    #    deny all;
    #
    #    proxy_pass http://localhost:9601/metrics; # Assuming metrics on port 9601
    # }
}
```

## Scaling

- **Vertical Scaling**: Increase the resources (CPU, RAM, Network I/O) of the server(s) running Sockudo.
- **Horizontal Scaling**: Run multiple instances of Sockudo. This requires:
  - **Load Balancer**: Distribute incoming connections across your Sockudo instances (e.g., Nginx, HAProxy, AWS ELB/ALB/NLB, Google Cloud Load Balancing).
    - Ensure your load balancer supports WebSocket connections (e.g., handling Upgrade and Connection headers correctly).
    - Session affinity ("sticky sessions") might be considered if your adapter doesn't perfectly share all necessary states for ongoing connections, though with the Pusher protocol and a robust adapter (like Redis or NATS), this is often less critical as the connection itself is stateful but messages can be broadcast. For HTTP API requests, standard load balancing (e.g., round-robin, least connections) is fine.
  - **Shared Adapter**: Configure Sockudo to use a shared adapter like Redis or NATS (`adapter.driver`). This is crucial for message broadcasting and state synchronization across all instances. See Adapter Configuration.
  - **Shared Backend Services**: If using features that rely on shared state (e.g., a database-backed App Manager, or a Redis-backed Cache/Queue/RateLimiter), ensure these backend services (Redis, MySQL, DynamoDB, SQS) are:
    - Accessible to all Sockudo instances.
    - Themselves scaled appropriately to handle the load from multiple Sockudo nodes.
    - Highly available.

## Configuration Management

- **Environment Variables**: Preferred for containerized environments (Docker, Kubernetes) and for sensitive data (like database passwords, API keys, app secrets). This avoids hardcoding secrets in config files.
- **Configuration Files**: Can be useful for complex setups. Store them securely and manage their deployment using tools like:
  - Version control (e.g., Git, but ensure secrets are not committed).
  - Configuration management tools (Ansible, Chef, Puppet, SaltStack).
  - Simple deployment scripts.
- **Secrets Management**: For sensitive configuration values, use dedicated secrets management tools:
  - HashiCorp Vault
  - AWS Secrets Manager
  - Azure Key Vault
  - Google Cloud Secret Manager
  - Kubernetes Secrets (ensure they are properly secured, e.g., with encryption at rest).

## Logging

- **systemd journal**: As shown in the service file example, logs can be directed to the system journal. Use journalctl to view them.
- **File Logging**: You can redirect Sockudo's stdout and stderr to files if needed:
  ```bash
  # Example:
  ./target/release/sockudo --config=./config.json > /var/log/sockudo/sockudo.out.log 2>> /var/log/sockudo/sockudo.err.log &
  ```
  Ensure the sockudo_user has write permissions to the log directory/files. Consider using log rotation tools like logrotate.
- **Centralized Logging**: For multi-instance deployments or easier analysis, send logs to a centralized logging platform:
  - ELK Stack (Elasticsearch, Logstash, Kibana) or OpenSearch equivalents.
  - Splunk
  - Grafana Loki
  - Datadog, New Relic, etc.

  This can be achieved by configuring Docker logging drivers, using agents like Fluentd/Fluent Bit, or having systemd forward journal logs.
- **Debug Mode** (`debug: true`): Only enable for troubleshooting specific issues, as it can be very verbose and may impact performance. Disable it in production environments.

## Security Best Practices

- **Run as Non-Root User**: Create a dedicated, unprivileged user for running the Sockudo process (as shown in systemd and Dockerfile examples).
- **Firewall**: Configure your server's host-based firewall (e.g., ufw, firewalld) and any network/cloud provider firewalls (e.g., AWS Security Groups, Azure NSGs) to only allow traffic on necessary ports (e.g., 443 for WSS if using a reverse proxy, your Sockudo port if direct, metrics port if exposed and restricted to trusted IPs).
- **SSL/TLS**: Always use HTTPS/WSS in production. Keep SSL certificates up-to-date (use tools like Certbot for automated renewal with Let's Encrypt). Use strong ciphers and protocols; disable outdated ones (e.g., SSLv3, TLSv1.0, TLSv1.1).
- **App Secrets**: Ensure your application secrets (`app.secret`) are strong, unique per application, and kept confidential. Store them securely using a secrets manager or environment variables, not hardcoded in version control.
- **Rate Limiting**: Enable and configure Sockudo's rate limiting features to protect against denial-of-service attacks and abuse from misbehaving clients. Consider edge rate limiting with your reverse proxy/CDN as well.
- **Regular Updates**: Keep Sockudo, its Rust dependencies (by rebuilding with an updated Cargo.lock), and the underlying operating system and any other software (Redis, Nginx, etc.) updated to patch known security vulnerabilities.
- **Input Validation**: While Sockudo handles protocol-level validation, ensure your application logic (e.g., in webhooks, or when processing client-sent events) validates any data received. Sanitize outputs to prevent XSS if data is displayed in UIs.
- **Principle of Least Privilege**: Ensure the Sockudo process and its dedicated user have only the minimum necessary permissions on the filesystem and network. Similarly, the credentials Sockudo uses to connect to backend services (databases, message queues) should have only the required permissions for Sockudo's operations (e.g., specific table access, not full admin rights).
- **Secure Backend Services**: If using Redis, NATS, MySQL, SQS, etc., ensure these services are also secured:
  - Use strong passwords/authentication.
  - Restrict network access to them (e.g., only allow connections from Sockudo server IPs).
  - Keep them updated.
- **Dependency Scanning**: Regularly scan your project's dependencies (including Rust crates) for known vulnerabilities using tools like `cargo audit`.
- **HTTP Security Headers**: If serving any HTTP content or through a proxy, implement security headers like `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`.
- **Monitoring and Alerting for Security**: Set up monitoring for suspicious activity, high error rates (which can indicate attacks), unauthorized access attempts, or significant deviations in traffic patterns. Use tools like Prometheus and Grafana (as detailed in the Monitoring Guide) to create alerts for security-related events. Consider integrating with a Security Information and Event Management (SIEM) system.
