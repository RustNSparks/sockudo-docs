# SSL/TLS Configuration

Sockudo supports encrypted connections using SSL/TLS for both its WebSocket (WSS) and HTTP API (HTTPS) endpoints. This is crucial for securing data in transit.

SSL/TLS settings are configured under the `ssl` object within the main `ServerOptions` in your `config.json`.

## SSL/TLS Settings (`ssl`)

* **JSON Key (Parent)**: `ssl`

### `ssl.enabled`
* **JSON Key**: `enabled`
* **Environment Variable**: `SSL_ENABLED` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: Enables or disables SSL/TLS. If `true`, you must provide paths to your certificate and private key.
* **Default Value**: `false`
* **Example (`config.json`)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "/etc/sockudo/certs/fullchain.pem",
        "key_path": "/etc/sockudo/certs/privkey.pem",
        "redirect_http": true
      }
    }
    ```
* **Example (Environment Variables)**:
    ```bash
    export SSL_ENABLED=true
    export SSL_CERT_PATH="/etc/sockudo/certs/fullchain.pem"
    export SSL_KEY_PATH="/etc/sockudo/certs/privkey.pem"
    ```

### `ssl.cert_path`
* **JSON Key**: `cert_path`
* **Environment Variable**: `SSL_CERT_PATH`
* **Type**: `string`
* **Description**: The absolute or relative path to your SSL certificate file. This is typically a PEM-encoded file containing the server's certificate, and potentially intermediate certificates.
* **Default Value**: `""`
* **Required**: Yes, if `ssl.enabled` is `true`.

### `ssl.key_path`
* **JSON Key**: `key_path`
* **Environment Variable**: `SSL_KEY_PATH`
* **Type**: `string`
* **Description**: The absolute or relative path to your SSL private key file. This key must correspond to the certificate specified in `cert_path`.
* **Default Value**: `""`
* **Required**: Yes, if `ssl.enabled` is `true`.

### `ssl.passphrase`
* **JSON Key**: `passphrase`
* **Environment Variable**: `SSL_PASSPHRASE`
* **Type**: `string` (optional)
* **Description**: The passphrase for your SSL private key, if the key is encrypted. If your key is not encrypted, omit this option or set it to `null`.
* **Default Value**: `null` (None)
* **Example (`config.json` with passphrase)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "...",
        "key_path": "...",
        "passphrase": "yourSecretPrivateKeyPassword"
      }
    }
    ```

### `ssl.ca_path`
* **JSON Key**: `ca_path`
* **Environment Variable**: `SSL_CA_PATH`
* **Type**: `string` (optional)
* **Description**: Path to a file containing trusted CA certificates in PEM format. This can be used for features like client certificate authentication, though Sockudo's direct support for client cert auth would need to be verified.
* **Default Value**: `null` (None)

### `ssl.redirect_http`
* **JSON Key**: `redirect_http`
* **Environment Variable**: `SSL_REDIRECT_HTTP` (Set to `true` or `1`)
* **Type**: `boolean`
* **Description**: If `ssl.enabled` is `true`, setting this to `true` will also start a basic HTTP server on the port specified by `ssl.http_port`. This HTTP server will automatically redirect all incoming HTTP requests to their HTTPS equivalents.
* **Default Value**: `false`
* **Example (`config.json`)**:
    ```json
    {
      "ssl": {
        "enabled": true,
        "cert_path": "...",
        "key_path": "...",
        "redirect_http": true,
        "http_port": 80 // Port for the HTTP redirect server
      }
    }
    ```

### `ssl.http_port`
* **JSON Key**: `http_port`
* **Environment Variable**: `SSL_HTTP_PORT`
* **Type**: `integer` (u16, optional)
* **Description**: The port number for the HTTP redirect server if `ssl.redirect_http` is `true`.
* **Default Value**: `80`

## Important Considerations for SSL:

* **Certificate and Key Format**: Ensure your certificate and private key are in a format compatible with Rustls (typically PEM).
* **Permissions**: The Sockudo process must have read access to the certificate and key files.
* **Renewal**: Remember to renew your SSL certificates before they expire. Automate this process if possible (e.g., using Let's Encrypt with Certbot).
* **Reverse Proxies**: If you are running Sockudo behind a reverse proxy (like Nginx or HAProxy) that handles SSL termination, you might not need to enable SSL directly in Sockudo. In such cases, the proxy handles HTTPS, and Sockudo can listen on HTTP locally. Ensure the proxy correctly forwards headers like `X-Forwarded-Proto` so Sockudo knows the original connection was secure.
