#!/usr/bin/env node

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tools
import { LIST_BUCKETS, handleListBuckets } from "./tools/listBuckets.js";
import { CREATE_BUCKET, handleCreateBucket } from "./tools/createBucket.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "IBM Cloud Object Storage MCP Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// SSE endpoint for MCP
app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");

  const transport = new SSEServerTransport("/messages", res);
  const server = new Server(
    {
      name: "ibm-cos-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        LIST_BUCKETS,
        CREATE_BUCKET,
        // Additional tools
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: toolArgs } = request.params;

      switch (name) {
        case LIST_BUCKETS.name:
          return await handleListBuckets(toolArgs);

        case CREATE_BUCKET.name:
          return await handleCreateBucket(toolArgs);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  await server.connect(transport);
});

// Messages endpoint
app.post("/messages", async (req, res) => {
  // This endpoint is used by the SSE transport
  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `IBM Cloud Object Storage MCP HTTP Server running on port ${PORT}`
  );
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
