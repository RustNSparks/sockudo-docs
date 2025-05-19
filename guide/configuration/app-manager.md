# App Manager Configuration

The App Manager is responsible for managing application credentials (like app ID, key, and secret) and their settings (e.g., max connections, enabled features, webhook configurations). Sockudo allows you to store and retrieve this application data from various backends.

Configuration for the App Manager is managed under the `app_manager` object in your `config.json`.

## Main App Manager Settings

* **JSON Key (Parent)**: `app_manager`

### `app_manager.driver`
* **JSON Key**: `driver`
* **Environment Variable**: `APP_MANAGER_DRIVER`
* **Type**: `enum` (string)
* **Description**: Specifies the backend driver for storing and managing application configurations.
* **Default Value**: `"memory"`
* **Possible Values**:
    * `"memory"`: Stores app configurations in memory. Suitable for single-instance deployments or when apps are defined directly in the config file. Data is lost when Sockudo restarts unless apps are defined in `app_manager.array.apps`.
    * `"mysql"`: Uses a MySQL database to store app configurations. Requires `database.mysql` to be configured.
    * `"dynamodb"`: Uses AWS DynamoDB to store app configurations. Requires `database.dynamodb` to be configured.
* **Example (`config.json`)**:
    ```json
    {
      "app_manager": {
        "driver": "mysql"
        // MySQL specific app manager settings might be inferred from `database.mysql`
      }
    }
    ```
* **Example (Environment Variable)**:
    ```bash
    export APP_MANAGER_DRIVER=mysql
    ```

### `app_manager.cache`
This sub-object configures caching for the App Manager itself, helping to reduce lookups to the backend datastore.

* **JSON Key (Parent Object)**: `app_manager.cache`

#### `app_manager.cache.enabled`
* **JSON Key**: `enabled`
* **Type**: `boolean`
* **Description**: Enables or disables caching for app configurations retrieved by the App Manager.
* **Default Value**: `true`

#### `app_manager.cache.ttl`
* **JSON Key**: `ttl`
* **Type**: `integer` (u64, seconds)
* **Description**: Time-to-live in seconds for cached app configurations.
* **Default Value**: `300` (5 minutes)
* **Example (`config.json`)**:
    ```json
    {
      "app_manager": {
        "driver": "mysql",
        "cache": {
          "enabled": true,
          "ttl": 600
        }
      }
    }
    ```

## Array App Manager (`app_manager.array`)

These settings are primarily used when `app_manager.driver` is set to `"memory"` and you want to define applications directly within the configuration file. Even with other drivers, apps defined here might be pre-loaded or registered on startup (behavior confirmed in `main.rs` [cite: uploaded:rustnsparks/sockudo/sockudo-a47486991577778dec2033c359ae40ff1cbee148/src/main.rs]).

* **JSON Key (Parent Object)**: `app_manager.array`

### `app_manager.array.apps`
* **JSON Key**: `apps`
* **Type**: `array` of `App` objects
* **Description**: A list of application configurations.
* **Default Value**: `[]` (empty array)
* **`App` Object Structure**: Each object in the array represents an application and has the following fields (defined in `src/app/config.rs` and `src/options.rs`):
    * `id` (string, required): A unique identifier for the app (e.g., "my-app-123").
    * `key` (string, required): The application key, used by clients to connect.
    * `secret` (string, required): The application secret, used for signing API requests and private channel authentication.
    * `max_connections` (integer, optional): Maximum number of concurrent connections allowed for this app. Default: `-1` (unlimited, but practically limited by system resources).
    * `enable_client_messages` (boolean, optional): Whether clients can publish messages directly to channels (client events). Default: `false`.
    * `enabled` (boolean, optional): Whether the app is currently active. Default: `true`.
    * `max_event_payload_in_kb` (integer, optional): Maximum payload size for a single event in kilobytes for this app. Overrides global if set. Default: `100`.
    * `max_channel_name_length` (integer, optional): Maximum length for channel names for this app. Overrides global if set. Default: `200`.
    * `max_event_name_length` (integer, optional): Maximum length for event names for this app. Overrides global if set. Default: `200`.
    * `max_channels_per_event` (integer, optional): Maximum number of channels an event can be published to at once for this app. Overrides global if set. Default: `100`.
    * `max_client_events_per_second` (integer, optional): Maximum number of client events a single connection can send per second for this app. Default: `10`.
    * `webhooks` (array of `Webhook` objects, optional): Configuration for webhooks specific to this app. See [Webhooks Configuration](./webhooks.md) for the `Webhook` object structure. Default: `[]`.
* **Example (`config.json`)**:
    ```json
    {
      "app_manager": {
        "driver": "memory",
        "array": {
          "apps": [
            {
              "id": "demo-app",
              "key": "demo-key",
              "secret": "demo-secret-shhh",
              "enable_client_messages": true,
              "enabled": true,
              "max_connections": 1000,
              "max_client_events_per_second": 20,
              "webhooks": [
                {
                  "url": "https://myapplication.com/webhooks/sockudo",
                  "event_types": ["channel_occupied", "channel_vacated"]
                }
              ]
            },
            {
              "id": "another-app",
              "key": "another-key",
              "secret": "another-secret-super-safe"
            }
          ]
        }
      }
    }
    ```

## Database-Backed App Managers

When using `"mysql"` or `"dynamodb"` as the `app_manager.driver`, Sockudo will expect the corresponding database connection details to be configured under the global `database` section.

* For **MySQL**: Configure `database.mysql`. The App Manager will use a table (default: `applications`) in this database.
    * See `src/app/mysql_app_manager.rs`.
    * The table structure would typically include columns for `id`, `key`, `secret`, `max_connections`, `enable_client_messages`, `enabled`, and potentially JSON/TEXT columns for more complex settings like `webhooks`.

* For **DynamoDB**: Configure `database.dynamodb`. The App Manager will use a DynamoDB table (default: `sockudo-applications`).
    * See `src/app/dynamodb_app_manager.rs`.
    * The table would have attributes corresponding to the `App` object fields.

Refer to the [**Database Configuration (Other Options)**](./other-options.md#database-configuration-database) section for details on setting up `database.mysql` and `database.dynamodb`.
