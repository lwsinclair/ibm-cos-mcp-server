/**
 * Delete an empty bucket
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  getCOSClient,
  formatCOSError,
  validateBucketName,
} from "../utils/connection.js";

export const DELETE_BUCKET: Tool = {
  name: "ibm_cos_delete_bucket",
  description:
    "Delete an empty bucket from IBM Cloud Object Storage. " +
    "The bucket must be empty before it can be deleted. " +
    "All objects (including versioned objects) must be removed first.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description: "Name of the bucket to delete",
      },
    },
    required: ["bucketName"],
  },
};

export async function handleDeleteBucket(args: any): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    // Validate bucket name
    validateBucketName(bucketName);

    const cosClient = getCOSClient();

    // Delete the bucket
    await cosClient.deleteBucket({ Bucket: bucketName }).promise();

    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully deleted bucket: ${bucketName}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting bucket: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
