#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";

// Import bucket tools
import { LIST_BUCKETS, handleListBuckets } from "./tools/listBuckets.js";
import { CREATE_BUCKET, handleCreateBucket } from "./tools/createBucket.js";
import { DELETE_BUCKET, handleDeleteBucket } from "./tools/deleteBucket.js";
import { HEAD_BUCKET, handleHeadBucket } from "./tools/headBucket.js";
import {
  GET_BUCKET_LOCATION,
  handleGetBucketLocation,
} from "./tools/getBucketLocation.js";
import {
  GET_BUCKET_VERSIONING,
  handleGetBucketVersioning,
} from "./tools/getBucketVersioning.js";
import {
  PUT_BUCKET_VERSIONING,
  handlePutBucketVersioning,
} from "./tools/putBucketVersioning.js";

// Import object operation tools
import { LIST_OBJECTS_V2, handleListObjectsV2 } from "./tools/listObjectsV2.js";
import { PUT_OBJECT, handlePutObject } from "./tools/putObject.js";
import { GET_OBJECT, handleGetObject } from "./tools/getObject.js";
import { DELETE_OBJECT, handleDeleteObject } from "./tools/deleteObject.js";
import { HEAD_OBJECT, handleHeadObject } from "./tools/headObject.js";
import { COPY_OBJECT, handleCopyObject } from "./tools/copyObject.js";
import { DELETE_OBJECTS, handleDeleteObjects } from "./tools/deleteObjects.js";
import {
  GET_OBJECT_TAGGING,
  handleGetObjectTagging,
} from "./tools/getObjectTagging.js";
import {
  PUT_OBJECT_TAGGING,
  handlePutObjectTagging,
} from "./tools/putObjectTagging.js";
import {
  DELETE_OBJECT_TAGGING,
  handleDeleteObjectTagging,
} from "./tools/deleteObjectTagging.js";

// Import multipart upload tools
import {
  CREATE_MULTIPART_UPLOAD,
  handleCreateMultipartUpload,
} from "./tools/createMultipartUpload.js";
import { UPLOAD_PART, handleUploadPart } from "./tools/uploadPart.js";
import {
  COMPLETE_MULTIPART_UPLOAD,
  handleCompleteMultipartUpload,
} from "./tools/completeMultipartUpload.js";
import {
  ABORT_MULTIPART_UPLOAD,
  handleAbortMultipartUpload,
} from "./tools/abortMultipartUpload.js";
import {
  LIST_MULTIPART_UPLOADS,
  handleListMultipartUploads,
} from "./tools/listMultipartUploads.js";
import { LIST_PARTS, handleListParts } from "./tools/listParts.js";

// Import CORS and ACL tools
import { GET_BUCKET_CORS, handleGetBucketCors } from "./tools/getBucketCors.js";
import { PUT_BUCKET_CORS, handlePutBucketCors } from "./tools/putBucketCors.js";
import {
  DELETE_BUCKET_CORS,
  handleDeleteBucketCors,
} from "./tools/deleteBucketCors.js";
import { GET_BUCKET_ACL, handleGetBucketAcl } from "./tools/getBucketAcl.js";
import { GET_OBJECT_ACL, handleGetObjectAcl } from "./tools/getObjectAcl.js";
import { PUT_BUCKET_ACL, handlePutBucketAcl } from "./tools/putBucketAcl.js";
import { PUT_OBJECT_ACL, handlePutObjectAcl } from "./tools/putObjectAcl.js";

// Import lifecycle tools
import {
  PUT_BUCKET_LIFECYCLE,
  handlePutBucketLifecycle,
} from "./tools/putBucketLifecycle.js";
import {
  GET_BUCKET_LIFECYCLE,
  handleGetBucketLifecycle,
} from "./tools/getBucketLifecycle.js";
import {
  DELETE_BUCKET_LIFECYCLE,
  handleDeleteBucketLifecycle,
} from "./tools/deleteBucketLifecycle.js";

// Import website hosting tools
import {
  PUT_BUCKET_WEBSITE,
  handlePutBucketWebsite,
} from "./tools/putBucketWebsite.js";
import {
  GET_BUCKET_WEBSITE,
  handleGetBucketWebsite,
} from "./tools/getBucketWebsite.js";
import {
  DELETE_BUCKET_WEBSITE,
  handleDeleteBucketWebsite,
} from "./tools/deleteBucketWebsite.js";

// Import list objects v1
import { LIST_OBJECTS, handleListObjects } from "./tools/listObjects.js";

// Load environment variables
config();

// Create server instance
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

// Define all available tools
const TOOLS: Tool[] = [
  // Bucket management (7 tools)
  LIST_BUCKETS,
  CREATE_BUCKET,
  DELETE_BUCKET,
  HEAD_BUCKET,
  GET_BUCKET_LOCATION,
  GET_BUCKET_VERSIONING,
  PUT_BUCKET_VERSIONING,

  // Object operations (10 tools)
  LIST_OBJECTS_V2,
  PUT_OBJECT,
  GET_OBJECT,
  DELETE_OBJECT,
  HEAD_OBJECT,
  COPY_OBJECT,
  DELETE_OBJECTS,
  GET_OBJECT_TAGGING,
  PUT_OBJECT_TAGGING,
  DELETE_OBJECT_TAGGING,

  // Multipart uploads (6 tools)
  CREATE_MULTIPART_UPLOAD,
  UPLOAD_PART,
  COMPLETE_MULTIPART_UPLOAD,
  ABORT_MULTIPART_UPLOAD,
  LIST_MULTIPART_UPLOADS,
  LIST_PARTS,

  // CORS and ACL (7 tools)
  GET_BUCKET_CORS,
  PUT_BUCKET_CORS,
  DELETE_BUCKET_CORS,
  GET_BUCKET_ACL,
  PUT_BUCKET_ACL,
  GET_OBJECT_ACL,
  PUT_OBJECT_ACL,

  // Lifecycle management (3 tools)
  PUT_BUCKET_LIFECYCLE,
  GET_BUCKET_LIFECYCLE,
  DELETE_BUCKET_LIFECYCLE,

  // Website hosting (3 tools)
  PUT_BUCKET_WEBSITE,
  GET_BUCKET_WEBSITE,
  DELETE_BUCKET_WEBSITE,

  // Legacy API (1 tool)
  LIST_OBJECTS,
];

// List all tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(
  CallToolRequestSchema,
  async (request, extra): Promise<CallToolResult> => {
    try {
      const { name, arguments: toolArgs } = request.params;

      switch (name) {
        // Bucket management
        case LIST_BUCKETS.name:
          return await handleListBuckets(toolArgs);
        case CREATE_BUCKET.name:
          return await handleCreateBucket(toolArgs);
        case DELETE_BUCKET.name:
          return await handleDeleteBucket(toolArgs);
        case HEAD_BUCKET.name:
          return await handleHeadBucket(toolArgs);
        case GET_BUCKET_LOCATION.name:
          return await handleGetBucketLocation(toolArgs);
        case GET_BUCKET_VERSIONING.name:
          return await handleGetBucketVersioning(toolArgs);
        case PUT_BUCKET_VERSIONING.name:
          return await handlePutBucketVersioning(toolArgs);

        // Object operations
        case LIST_OBJECTS_V2.name:
          return await handleListObjectsV2(toolArgs);
        case PUT_OBJECT.name:
          return await handlePutObject(toolArgs);
        case GET_OBJECT.name:
          return await handleGetObject(toolArgs);
        case DELETE_OBJECT.name:
          return await handleDeleteObject(toolArgs);
        case HEAD_OBJECT.name:
          return await handleHeadObject(toolArgs);
        case COPY_OBJECT.name:
          return await handleCopyObject(toolArgs);
        case DELETE_OBJECTS.name:
          return await handleDeleteObjects(toolArgs);
        case GET_OBJECT_TAGGING.name:
          return await handleGetObjectTagging(toolArgs);
        case PUT_OBJECT_TAGGING.name:
          return await handlePutObjectTagging(toolArgs);
        case DELETE_OBJECT_TAGGING.name:
          return await handleDeleteObjectTagging(toolArgs);

        // Multipart uploads
        case CREATE_MULTIPART_UPLOAD.name:
          return await handleCreateMultipartUpload(toolArgs);
        case UPLOAD_PART.name:
          return await handleUploadPart(toolArgs);
        case COMPLETE_MULTIPART_UPLOAD.name:
          return await handleCompleteMultipartUpload(toolArgs);
        case ABORT_MULTIPART_UPLOAD.name:
          return await handleAbortMultipartUpload(toolArgs);
        case LIST_MULTIPART_UPLOADS.name:
          return await handleListMultipartUploads(toolArgs);
        case LIST_PARTS.name:
          return await handleListParts(toolArgs);

        // CORS and ACL
        case GET_BUCKET_CORS.name:
          return await handleGetBucketCors(toolArgs);
        case PUT_BUCKET_CORS.name:
          return await handlePutBucketCors(toolArgs);
        case DELETE_BUCKET_CORS.name:
          return await handleDeleteBucketCors(toolArgs);
        case GET_BUCKET_ACL.name:
          return await handleGetBucketAcl(toolArgs);
        case PUT_BUCKET_ACL.name:
          return await handlePutBucketAcl(toolArgs);
        case GET_OBJECT_ACL.name:
          return await handleGetObjectAcl(toolArgs);
        case PUT_OBJECT_ACL.name:
          return await handlePutObjectAcl(toolArgs);

        // Lifecycle management
        case PUT_BUCKET_LIFECYCLE.name:
          return await handlePutBucketLifecycle(toolArgs);
        case GET_BUCKET_LIFECYCLE.name:
          return await handleGetBucketLifecycle(toolArgs);
        case DELETE_BUCKET_LIFECYCLE.name:
          return await handleDeleteBucketLifecycle(toolArgs);

        // Website hosting
        case PUT_BUCKET_WEBSITE.name:
          return await handlePutBucketWebsite(toolArgs);
        case GET_BUCKET_WEBSITE.name:
          return await handleGetBucketWebsite(toolArgs);
        case DELETE_BUCKET_WEBSITE.name:
          return await handleDeleteBucketWebsite(toolArgs);

        // Legacy API
        case LIST_OBJECTS.name:
          return await handleListObjects(toolArgs);

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
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup message to stderr so it doesn't interfere with MCP communication
  console.error("IBM Cloud Object Storage MCP Server running on stdio");
  console.error(`Total tools available: ${TOOLS.length}`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
