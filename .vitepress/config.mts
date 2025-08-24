import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sockudo",
  description:
    "A high-performance, Pusher-compatible WebSockets server written in Rust.",
  base: "/", // Adjust if you're deploying to a subdirectory like username.github.io/sockudo-docs/
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }], // Adjust path if base is different
    // You can add other meta tags here
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg", // Path relative to the 'public' directory in `docs`

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide" },
      { text: "API Reference", link: "/api/" },
      { text: "Concepts", link: "/concepts/architecture" },
      { text: "Integrations", link: "/integrations/index" },
      {
        text: "Links",
        items: [
          { text: "GitHub", link: "https://github.com/RustNSparks/sockudo" },
          // Add other relevant links here, e.g., RustNSparks organization
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          link: "/guide/",
          collapsed: false,
          items: [{ text: "Getting Started", link: "/guide/getting-started" }],
        },
        {
          text: "Configuration",
          collapsed: false,
          items: [
            { text: "Overview", link: "/guide/configuration" },
            {
              text: "Server Options",
              link: "/guide/configuration/server-options",
            },
            { text: "Adapter", link: "/guide/configuration/adapter" },
            { text: "App Manager", link: "/guide/configuration/app-manager" },
            { text: "Cache", link: "/guide/configuration/cache" },
            { text: "Queue", link: "/guide/configuration/queue" },
            { text: "Metrics", link: "/guide/configuration/metrics" },
            { text: "Rate Limiter", link: "/guide/configuration/rate-limiter" },
            { text: "SSL/TLS", link: "/guide/configuration/ssl" },
            // { text: "Cluster", link: "/guide/configuration/cluster" },
            { text: "Origin Validation", link: "/guide/configuration/origin-validation" },
            { text: "Webhooks", link: "/guide/configuration/webhooks" },
            {
              text: "Other Options",
              link: "/guide/configuration/other-options",
            },
          ],
        },
        {
          text: "Advanced Usage",
          collapsed: false,
          items: [
            { text: "Deployment", link: "/guide/deployment" },
            { text: "Monitoring", link: "/guide/monitoring" },
            { text: "Troubleshooting", link: "/guide/troubleshooting" },
            { text: "Performance Benchmarks", link: "/guide/performance-benchmarks" },
          ],
        },
      ],
      "/concepts/": [
        {
          text: "Core Concepts",
          collapsed: false,
          items: [
            { text: "Architecture", link: "/concepts/architecture" },
            {
              text: "Pusher Compatibility",
              link: "/concepts/pusher-compatibility",
            },
            { text: "Security", link: "/concepts/security" },
            { text: "Scaling", link: "/concepts/scaling" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/api/" },
            {
              text: "HTTP API",
              link: "/api/http-api",
              items: [
                // Nested items for specific HTTP API endpoints
                {
                  text: "Trigger Events",
                  link: "/api/http-api/trigger-events",
                },
                { text: "Batch Events", link: "/api/http-api/batch-events" },
                { text: "Channel Info", link: "/api/http-api/channel-info" },
                {
                  text: "User Management",
                  link: "/api/http-api/user-management",
                },
              ],
            },
            { text: "WebSocket API", link: "/api/websocket-api" },
          ],
        },
      ],
      '/integrations/': [
        {
          text: 'Getting Started with Integrations',
          // collapsed: true, // Set to false if you want it open by default
          items: [
            { text: 'Introduction', link: '/integrations/' } // Links to docs/integrations/index.md
          ]
        },
        {
          text: 'Client-Side Libraries',
          collapsed: false,
          items: [
            { text: 'Laravel Echo', link: '/integrations/laravel-echo' },
            { text: 'PusherJS (Standalone)', link: '/integrations/pusher-js' },
            // Assuming your other-clients.md has a heading like "## Client-Side Libraries (for Subscribing to Events)"
            { text: 'Mobile & Other Clients', link: '/integrations/other-clients#client-side-libraries-for-subscribing-to-events' }
          ]
        },
      ],
      "/about/": [
        {
          text: "About Sockudo",
          collapsed: false,
          items: [
            { text: "License", link: "/about/license" },
            { text: "Acknowledgements", link: "/about/acknowledgements" },
            { text: "Contributing", link: "/advanced/contributing" }, // Moved contributing here as it's more "about" the project
          ],

        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/RustNSparks/sockudo" },
      { icon: "discord", link: "https://discord.gg/MRhmYg68RY" },
      { icon: "x", link: "https://x.com/sockudorealtime" },
    ],

    editLink: {
      pattern: "https://github.com/RustNSparks/sockudo/edit/main/docs/:path", // Assuming 'main' branch and docs in 'docs' folder
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2025-${new Date().getFullYear()} RustNSparks & Contributors`,
    },

    // Search Configuration (VitePress Default Algolia or Local Search)
    // For local search (simpler to set up initially):
    search: {
      provider: "local",
    },

    // If you want to use Algolia (requires setup with Algolia):
    // algolia: {
    //   appId: 'YOUR_ALGOLIA_APP_ID',
    //   apiKey: 'YOUR_ALGOLIA_API_KEY',
    //   indexName: 'YOUR_ALGOLIA_INDEX_NAME'
    // },

    // Carbon Ads (Optional)
    // carbonAds: {
    //   code: 'YOUR_CARBON_PLACEMENT_CODE',
    //   placement: 'YOUR_CARBON_PLACEMENT_NAME'
    // }
  },

  // Markdown processing options
  markdown: {
    // lineNumbers: true, // Enable line numbers for code blocks
    // Options for markdown-it plugins
  },
});
