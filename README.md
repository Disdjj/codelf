# MCP Server Template 🛠️

A starter template for building your own Model Context Protocol (MCP) server. This template provides the basic structure and setup needed to create custom MCPs that can be used with Cursor or Claude Desktop.

## Features

- Basic MCP server setup with TypeScript
- Sample tool implementation
- Ready-to-use project structure
- Built with [@modelcontextprotocol/sdk](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)

## Project Structure

```
mcp-server-template/
├── index.ts        # Main server implementation
├── package.json    # Project dependencies
├── tsconfig.json   # TypeScript configuration
└── build/         # Compiled JavaScript output
```

## Getting Started

1. Clone this template:
```bash
git clone [your-repo-url] my-mcp-server
cd my-mcp-server
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

This will generate the `/build/index.js` file - your compiled MCP server script.

## Using with Cursor

1. Go to Cursor Settings -> MCP -> Add new MCP server
2. Configure your MCP:
   - Name: [choose your own name]
   - Type: command
   - Command: `node ABSOLUTE_PATH_TO_MCP_SERVER/build/index.js`

## Using with Claude Desktop

Add the following MCP config to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "your-mcp-name": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO_MCP_SERVER/build/index.js"]
    }
  }
}
```

## Development

The template includes a sample tool implementation in `index.ts`. To create your own MCP:

1. Modify the server configuration in `index.ts`:
```typescript
const server = new McpServer({
  name: "your-mcp-name",
  version: "0.0.1",
});
```

2. Define your custom tools using the `server.tool()` method:
```typescript
server.tool(
  "your-tool-name",
  "Your tool description",
  {
    // Define your tool's parameters using Zod schema
    parameter: z.string().describe("Parameter description"),
  },
  async ({ parameter }) => {
    // Implement your tool's logic here
    return {
      content: [
        {
          type: "text",
          text: "Your tool's response",
        },
      ],
    };
  }
);
```

3. Build and test your implementation:
```bash
npm run build
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
