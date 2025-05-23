# Webhooks Configuration

Sockudo can send webhooks to your application to notify it of various events occurring on the WebSocket server, such as when channels become occupied or vacated, or when members join or leave presence channels.

Global webhook settings, particularly for batching, are configured under the `webhooks` object in your `config.json`. Specific webhook endpoints and event types are typically defined per application within the App Manager configuration.

## Global Webhook Settings (`webhooks`)

These settings apply to the overall webhook sending mechanism.

**JSON Key (Parent):** `webhooks`

### Batching Configuration (`webhooks.batching`)

Sockudo can batch multiple webhook events together before sending them to your application. This can reduce the number of HTTP requests to your webhook endpoint.

**JSON Key (Parent Object):** `webhooks.batching`

#### `webhooks.batching.enabled`

- **JSON Key:** `enabled`
- **Type:** boolean
- **Description:** Enables or disables webhook batching.
- **Default Value:** `true`

#### `webhooks.batching.duration`

- **JSON Key:** `duration`
- **Type:** integer (u64, milliseconds)
- **Description:** The maximum duration (in milliseconds) to buffer webhook events before sending a batch, if batching is enabled. Even if the batch isn't full, it will be sent after this duration.
- **Default Value:** `50` (milliseconds)

### Example (`config.json` for global batching)

```json
{
  "webhooks": {
    "batching": {
      "enabled": true,
      "duration": 100
    }
  }
  // ... other configurations
}
```

## Per-Application Webhook Configuration

Individual webhook endpoints, the events they subscribe to, and other details are configured within each application's definition. This is typically done in the `apps` array under `app_manager.array` if using the memory app manager, or in the corresponding database record if using a database-backed app manager.

Refer to the App object structure within the App Manager Configuration for how to define the `webhooks` array for an app.

### Webhook Object Structure (within an App's `webhooks` array)

This structure is based on `src/webhook/types.rs`.

#### Properties

- **`url`** (string, optional): The HTTP(S) URL of your application's endpoint that will receive the webhook POST requests.

- **`lambda_function`** (string, optional): The name of an AWS Lambda function to invoke for the webhook.

- **`lambda`** (object, optional, structure based on `LambdaWebhookConfig`):
  - **`function_name`** (string): Name of the Lambda function.
  - **`invocation_type`** (string, optional): Lambda invocation type (e.g., "RequestResponse", "Event"). Default: "Event".
  - **`qualifier`** (string, optional): Lambda function version or alias.
  - **`region`** (string, optional): AWS region for the Lambda function. If not set, might use default from SDK.
  - **`endpoint_url`** (string, optional): Custom AWS Lambda endpoint URL (for testing with LocalStack, etc.).

- **`event_types`** (array of strings, required): A list of event types that should trigger this webhook. Common Pusher event types include:
  - `channel_occupied`: Sent when a channel first becomes active (first subscriber).
  - `channel_vacated`: Sent when a channel becomes empty (last subscriber leaves).
  - `member_added`: Sent when a user joins a presence channel.
  - `member_removed`: Sent when a user leaves a presence channel.
  - `client_event`: Sent when a client sends an event on a channel (if enabled and configured).

- **`filter`** (object, optional, structure based on `WebhookFilter`): Defines filters for when to send webhooks.
  - **`channel_type`** (string, optional): Filter by channel type (e.g., "public", "private", "presence").
  - **`channel_prefix`** (string, optional): Filter by channel name prefix (e.g., "private-").

- **`headers`** (object, map of string to string, optional): Custom HTTP headers to include in the webhook request sent to a `url`.

### Example (App definition with webhooks in `config.json`)

```json
{
  "app_manager": {
    "driver": "memory",
    "array": {
      "apps": [
        {
          "id": "my-app-with-webhooks",
          "key": "app-key-wh",
          "secret": "app-secret-wh",
          "webhooks": [
            {
              "url": "https://api.example.com/sockudo/events",
              "event_types": ["channel_occupied", "channel_vacated"],
              "headers": {
                "X-Custom-Auth": "mysecrettoken"
              }
            },
            {
              "lambda": {
                "function_name": "sockudoPresenceHandler",
                "region": "us-east-1"
              },
              "event_types": ["member_added", "member_removed"],
              "filter": {
                "channel_prefix": "presence-"
              }
            }
          ]
        }
      ]
    }
  },
  "webhooks": {
    "batching": {
      "enabled": true,
      "duration": 75
    }
  }
}
```

## Webhook Payload

The payload sent to your webhook endpoint will typically be a JSON object (or an array of objects if batched) containing information about the event(s). The structure is compatible with Pusher webhook payloads.

### Example single event payload for `member_added`

```json
{
  "name": "member_added",
  "channel": "presence-globalchat",
  "event": "pusher_internal:member_added",
  "data": "{\"user_id\":\"user-123\",\"user_info\":{\"name\":\"Alice\"}}",
  "socket_id": "some-socket-id",
  "user_id": "user-123",
  "time_ms": 1678886400000
}
```

### Batched payload example

If batching is enabled, your endpoint might receive an array:

```json
{
  "time_ms": 1678886400500,
  "events": [
    {
      "name": "member_added",
      "channel": "presence-chat",
      "user_id": "u1",
      "...": "..."
    },
    {
      "name": "channel_vacated",
      "channel": "private-room-1",
      "...": "..."
    }
  ]
}
```

### Best Practices

Your application should be prepared to:

- Parse this JSON and handle the events accordingly
- Handle retries (if Sockudo implements them)
- Respond quickly with a 2xx status code to acknowledge receipt
- Be robust in handling webhook failures

Non-2xx responses may be considered failures by Sockudo.

## Queue for Webhooks

Webhook processing often utilizes the Queue System. If a queue driver (like Redis or SQS) is configured, webhook events are typically pushed onto the queue and processed by background workers.
