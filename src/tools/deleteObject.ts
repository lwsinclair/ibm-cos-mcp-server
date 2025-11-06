/**
 * Delete an object from a bucket
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { getCOSClient, formatCOSError } from "../utils/connection.js";

export const DELETE_OBJECT: Tool = {
  name: "ibm_cos_delete_object",
  description:
    "Delete an object from IBM Cloud Object Storage. " +
    "If versioning is enabled, this creates a delete marker. " +
    "Specify versionId to permanently delete a specific version.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description: "Name of the bucket",
      },
      key: {
        type: "string",
        description: "Object key to delete",
      },
      versionId: {
        type: "string",
        description: "Specific version to delete (optional)",
        optional: true,
      },
    },
    required: ["bucketName", "key"],
  },
};

export async function handleDeleteObject(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, versionId } = args;

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
    };

    if (versionId) params.VersionId = versionId;

    const response = await cosClient.deleteObject(params).promise();

    let output = `✅ Successfully deleted object\n\n`;
    output += `Details:\n`;
    output += `- Bucket: ${bucketName}\n`;
    output += `- Key: ${key}\n`;

    if (versionId) {
      output += `- Version ID: ${versionId}\n`;
    } else if (response.DeleteMarker) {
      output += `- Delete Marker: ${response.DeleteMarker}\n`;
      output += `- Version ID: ${response.VersionId}\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting object: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
