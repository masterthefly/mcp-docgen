// Sample MCP server implementation for testing
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

const server = new Server(
  {
    name: 'sample-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

// Add sample tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'sample_tool',
        description: 'A sample tool for testing',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' }
          }
        }
      }
    ]
  };
});

module.exports = server;