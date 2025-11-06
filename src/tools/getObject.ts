/**
 * Download an object from a bucket
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { getCOSClient, formatCOSError } from "../utils/connection.js";

export const GET_OBJECT: Tool = {
  name: "ibm_cos_get_object",
  description:
    "Download an object from IBM Cloud Object Storage. " +
    "Returns object content and metadata. " +
    "Supports conditional downloads and byte range requests.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description: "Name of the bucket",
      },
      key: {
        type: "string",
        description: "Object key to download",
      },
      range: {
        type: "string",
        description: 'Byte range to download (e.g., "bytes=0-1023")',
        optional: true,
      },
      versionId: {
        type: "string",
        description: "Specific version to download",
        optional: true,
      },
      ifModifiedSince: {
        type: "string",
        description: "Download only if modified since this date (ISO 8601)",
        optional: true,
      },
      ifMatch: {
        type: "string",
        description: "Download only if ETag matches",
        optional: true,
      },
    },
    required: ["bucketName", "key"],
  },
};

export async function handleGetObject(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, range, versionId, ifModifiedSince, ifMatch } =
      args;

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
    };

    if (range) params.Range = range;
    if (versionId) params.VersionId = versionId;
    if (ifModifiedSince) params.IfModifiedSince = new Date(ifModifiedSince);
    if (ifMatch) params.IfMatch = ifMatch;

    const response = await cosClient.getObject(params).promise();

    // Convert body to string if possible
    let bodyContent = "Binary content (not displayable)";
    if (response.Body) {
      try {
        bodyContent = response.Body.toString("utf-8");
        // Truncate if too long
        if (bodyContent.length > 1000) {
          bodyContent = bodyContent.substring(0, 1000) + "\n... (truncated)";
        }
      } catch (e) {
        // Keep default message for binary content
      }
    }

    let output = `✅ Successfully retrieved object\n\n`;
    output += `Metadata:\n`;
    output += `- Bucket: ${bucketName}\n`;
    output += `- Key: ${key}\n`;
    output += `- Content-Type: ${response.ContentType || "N/A"}\n`;
    output += `- Content-Length: ${response.ContentLength || 0} bytes\n`;
    output += `- ETag: ${response.ETag || "N/A"}\n`;
    output += `- Last Modified: ${
      response.LastModified?.toISOString() || "N/A"
    }\n`;

    if (response.VersionId) output += `- Version ID: ${response.VersionId}\n`;
    if (response.StorageClass)
      output += `- Storage Class: ${response.StorageClass}\n`;

    // Add custom metadata if present
    if (response.Metadata && Object.keys(response.Metadata).length > 0) {
      output += `\nCustom Metadata:\n`;
      for (const [key, value] of Object.entries(response.Metadata)) {
        output += `- ${key}: ${value}\n`;
      }
    }

    output += `\nContent Preview:\n${bodyContent}`;

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
          text: `Error getting object: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
