# /docs/guide/channels.md

# Channels in Sockudo

Channels are the fundamental way to group and filter messages in Sockudo, much like in Pusher. Clients subscribe to channels, and events are published to these channels. Sockudo supports three main types of channels:

## 1. Public Channels

-   **Naming Convention:** Any name that doesn't start with `private-` or `presence-`. For example, `my-channel`, `updates`, `chat-room-123`.
-   **Subscription:** Any client can subscribe to a public channel without any special authorization.
-   **Use Cases:** Broadcasting public information, live scores, general announcements.

**Example (Client-side with `pusher-js`):**
```javascript
// Subscribe to a public channel
const publicChannel = pusher.subscribe('news-updates');

// Bind to an event on this channel
publicChannel.bind('new-article', function(data) {
  console.log('A new article was published:', data);
});
```

## 2. Private Channels

-   **Naming Convention:** Must start with `private-`. For example, `private-user-123`, `private-orders-for-user-abc`.
-   **Subscription:** Clients must be authorized to subscribe to private channels. This typically involves your application server authenticating the user and then signing a subscription request that the client sends to Sockudo.
-   **Use Cases:** User-specific notifications, private chats between two users (though presence channels are often better for chat features), secure data transmission to authenticated users.

### Authentication Flow for Private Channels:

1.  Client attempts to subscribe to a `private-` channel.
2.  The `pusher-js` library (or equivalent) makes an HTTP POST request to an authentication endpoint on your application server (you configure this endpoint in the client library).
3.  Your server receives the request, which includes the `socket_id` of the connection and the `channel_name`.
4.  Your server verifies if the currently logged-in user is allowed to access this channel.
5.  If authorized, your server generates an authentication signature using your Sockudo app's `secret` and returns a JSON response like:
    ```json
    {
      "auth": "YOUR_APP_KEY:SIGNATURE"
    }
    ```
    The signature is typically `HMAC-SHA256` of `socket_id:channel_name`.
6.  The client library sends this auth signature to Sockudo.
7.  Sockudo verifies the signature and, if valid, allows the subscription.

**Example (Client-side with `pusher-js`):**
```javascript
const pusher = new Pusher('YOUR_APP_KEY', {
  cluster: 'your-cluster', // Not strictly needed for Sockudo if host/port specified
  wsHost: 'localhost',
  wsPort: 6001,
  forceTLS: false,
  authEndpoint: '/pusher/auth' // Your application's auth endpoint
});

// Subscribe to a private channel
const privateChannel = pusher.subscribe('private-user-notifications-123');

privateChannel.bind('new_message', function(data) {
  console.log('Received a private message:', data);
});
```

## 3. Presence Channels

-   **Naming Convention:** Must start with `presence-`. For example, `presence-chat-room-xyz`, `presence-collaboration-doc-1`.
-   **Subscription:** Similar to private channels, clients must be authorized. The authentication response is slightly different as it includes user information.
-   **Features:**
    -   Tracks which users are subscribed to the channel ("presence").
    -   Notifies other members when users join (`pusher:member_added`) or leave (`pusher:member_removed`) the channel.
    -   Allows clients to retrieve the list of current members (`pusher:subscription_succeeded`).
-   **Use Cases:** Chat rooms showing online users, collaborative editing tools displaying active participants, live dashboards of connected users.

### Authentication Flow for Presence Channels:

The flow is similar to private channels, but the JSON response from your auth endpoint must also include `channel_data`, which contains information about the user subscribing:

```json
{
  "auth": "YOUR_APP_KEY:SIGNATURE",
  "channel_data": "{\"user_id\":\"unique_user_id_123\",\"user_info\":{\"name\":\"Alice\",\"email\":\"alice@example.com\"}}"
}
```
The `channel_data` is a JSON string. The signature is typically `HMAC-SHA256` of `socket_id:channel_name:channel_data`.

**Example (Client-side with `pusher-js`):**
```javascript
const presenceChannel = pusher.subscribe('presence-game-lobby');

presenceChannel.bind('pusher:subscription_succeeded', function(members) {
  console.log('Successfully subscribed to presence channel!');
  members.each(function(member) {
    console.log('Member present:', member.id, member.info);
  });
});

presenceChannel.bind('pusher:member_added', function(member) {
  console.log('Member joined:', member.id, member.info);
});

presenceChannel.bind('pusher:member_removed', function(member) {
  console.log('Member left:', member.id, member.info);
});

presenceChannel.bind('new-game-start', function(data) {
  console.log('Game starting:', data);
});
```

## Client Events

If `enable_client_messages` is `true` in the app configuration, clients can trigger events directly on channels they are subscribed to. These are called "client events."

-   **Naming Convention:** Must be prefixed with `client-`. For example, `client-typing`, `client-mouse-move`.
-   **Security:** Use with caution. Client events are broadcast to other subscribed clients on that channel (excluding the sender by default, unless configured otherwise in some Pusher libraries or server implementations). They do not go through your application server first for validation, unless you implement a mechanism to relay them.
-   **Use Cases:** Indicating typing status in a chat, real-time cursor movements.

**Example (Client-side with `pusher-js`):**
```javascript
// Assuming 'channel' is a subscribed public, private, or presence channel
if (channel.subscribed) {
  channel.trigger('client-user-typing', { userId: 'user123', isTyping: true });
}
```

Understanding these channel types is key to designing effective real-time communication in your application using Sockudo.
