# /docs/guide/webhooks.md

# Webhooks

Sockudo can send HTTP POST requests (webhooks) to your application server when certain events occur within the WebSocket system. This allows you to react to real-time events, store data, trigger other processes, or audit activity.

## Configuration

Webhooks are configured per application within the `app_manager.apps` array in your `config.json` file.

Each app can have a `webhooks` array, where each object defines a specific webhook endpoint and the events that trigger it:

```json
// Part of config.json
"app_manager": {
  "driver": "memory",
  "apps": [
    {
      "id": "app-id",
      "key": "app-key",
      // ... other app settings
      "webhooks": [
        {
          "url": "[https://yourapi.com/sockudo/webhooks/presence](https://yourapi.com/sockudo/webhooks/presence)",
          "events": ["member_added", "member_removed"]
        },
        {
          "url": "[https://yourapi.com/sockudo/webhooks/channel_activity](https://yourapi.com/sockudo/webhooks/channel_activity)",
          "events": ["channel_occupied", "channel_vacated", "client_event"]
        }
      ]
    }
  ]
}
```

-   `url`: The HTTP(S) endpoint where Sockudo will send the POST request.
-   `events`: An array of strings specifying which event types will trigger this webhook.

## Supported Event Types

Sockudo aims for Pusher compatibility, so common webhook events include:

-   **`channel_occupied`**: Triggered when a channel, previously empty, gets its first subscriber.
-   **`channel_vacated`**: Triggered when a channel becomes empty (last subscriber leaves).
-   **`member_added`**: Triggered when a user subscribes to a *presence channel*.
-   **`member_removed`**: Triggered when a user unsubscribes from a *presence channel*.
-   **`client_event`**: Triggered when a client sends a client event (if `enable_client_messages` is true and the event is successfully broadcast).

*(The exact list of supported events and their payload structure should be verified against Sockudo's specific implementation, potentially detailed in `src/webhook/types.rs` or related modules.)*

## Webhook Payload

When an event occurs, Sockudo sends a POST request to the configured `url` with a `Content-Type: application/json` header. The body of the request is a JSON object containing information about the event.

The general structure of the payload often looks like this (Pusher-like):

```json
{
  "time_ms": 1678886400000, // Timestamp of the event
  "events": [
    {
      "name": "member_added", // The type of event
      "channel": "presence-chat-room", // The channel it occurred on
      "user_id": "user-123" // For presence events, the user_id
      // ... other event-specific data
    }
    // Potentially multiple events if batched, though usually one primary event per request
  ]
}
```

**Example Payload for `member_added`:**
```json
{
  "time_ms": 1678886400123,
  "events": [
    {
      "name": "member_added",
      "channel": "presence-room-1",
      "user_id": "client-abc-123"
    }
  ]
}
```

**Example Payload for `client_event`:**
```json
{
  "time_ms": 1678886400234,
  "events": [
    {
      "name": "client_event",
      "channel": "private-user-updates-7",
      "event": "client-typing", // The actual client event name
      "data": "{\"isTyping\":true}", // The data sent with the client event (as a string)
      "socket_id": "12345.67890", // Socket ID of the sender
      "user_id": "optional-user-id-if-presence-channel" // Optional, if the client event was on a presence channel
    }
  ]
}
```

## Security

To ensure that webhook requests genuinely originate from your Sockudo server, you can:

1.  **Use HTTPS:** Always use `https://` URLs for your webhook endpoints.
2.  **Signature Verification (Recommended):**
    Sockudo (like Pusher) should sign webhook requests. The request would include an `X-Pusher-Key` header (your app key) and an `X-Pusher-Signature` header.
    The signature is an HMAC SHA256 hash of the request body, using your app's `secret` as the key. Your endpoint should recalculate this signature and compare it to the one in the header.

    **Verification Logic (Conceptual):**
    ```
    app_secret = "YOUR_APP_SECRET"
    received_signature = request.headers["X-Pusher-Signature"]
    request_body = request.raw_body

    expected_signature = hmac_sha256(app_secret, request_body)

    if received_signature == expected_signature:
        # Webhook is authentic
    else:
        # Webhook is not authentic, ignore or log an error
    ```

    *(Confirm if Sockudo implements this standard Pusher webhook signing mechanism by checking its source code, particularly around `src/webhook/sender.rs` or related HTTP client logic.)*

3.  **IP Whitelisting:** If your Sockudo server has a static IP, you can whitelist this IP on your application server's firewall. This is less flexible if your Sockudo deployment IPs change.

## Retries and Timeouts

-   **Timeouts:** Your webhook endpoint should respond quickly (ideally within a few seconds, e.g., 2-5 seconds). Sockudo will have a timeout for webhook requests.
-   **Retries:** It's good practice for webhook senders to implement a retry mechanism with backoff if an endpoint fails to respond or returns an error (e.g., 5xx status codes).
    *(Check Sockudo's implementation in `src/queue/` and `src/webhook/` for details on its retry behavior, especially if using a persistent queue like Redis or SQS for webhooks.)*

By using webhooks, you can build powerful integrations and react to real-time events happening within your Sockudo-powered applications.
