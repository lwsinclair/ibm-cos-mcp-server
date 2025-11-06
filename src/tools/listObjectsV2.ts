/**
 * List objects in a bucket using v2 API (recommended)
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { getCOSClient, formatCOSError } from "../utils/connection.js";

export const LIST_OBJECTS_V2: Tool = {
  name: "ibm_cos_list_objects_v2",
  description:
    "List objects in a bucket using the v2 API with continuation token support. " +
    "Returns up to 1000 objects per request. Use continuation token for pagination. " +
    "Supports filtering by prefix and delimiter for hierarchical listing.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description: "Name of the bucket to list objects from",
      },
      prefix: {
        type: "string",
        description: "Limits results to keys that begin with the prefix",
        optional: true,
      },
      delimiter: {
        type: "string",
        description:
          'Character used to group keys (e.g., "/" for folder-like structure)',
        optional: true,
      },
      maxKeys: {
        type: "number",
        description: "Maximum number of keys to return (default 1000)",
        optional: true,
      },
      continuationToken: {
        type: "string",
        description: "Token from previous request to continue listing",
        optional: true,
      },
      startAfter: {
        type: "string",
        description: "Start listing after this key",
        optional: true,
      },
      fetchOwner: {
        type: "boolean",
        description: "Include owner information in response",
        optional: true,
      },
    },
    required: ["bucketName"],
  },
};

export async function handleListObjectsV2(args: any): Promise<CallToolResult> {
  try {
    const {
      bucketName,
      prefix,
      delimiter,
      maxKeys,
      continuationToken,
      startAfter,
      fetchOwner,
    } = args;

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
    };

    if (prefix) params.Prefix = prefix;
    if (delimiter) params.Delimiter = delimiter;
    if (maxKeys) params.MaxKeys = maxKeys;
    if (continuationToken) params.ContinuationToken = continuationToken;
    if (startAfter) params.StartAfter = startAfter;
    if (fetchOwner) params.FetchOwner = fetchOwner;

    const response = await cosClient.listObjectsV2(params).promise();

    if (!response.Contents || response.Contents.length === 0) {
      let message = `No objects found in bucket: ${bucketName}`;
      if (prefix) message += ` with prefix: ${prefix}`;

      return {
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    }

    // Format the output
    let output = `📦 Bucket: ${bucketName}\n`;
    if (prefix) output += `   Prefix: ${prefix}\n`;
    output += `   Found ${response.KeyCount} object(s)\n\n`;

    // List common prefixes (folders)
    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      output += "📁 Folders:\n";
      for (const commonPrefix of response.CommonPrefixes) {
        output += `   ${commonPrefix.Prefix}\n`;
      }
      output += "\n";
    }

    // List objects
    output += "📄 Objects:\n";
    for (const obj of response.Contents) {
      output += `   ${obj.Key}\n`;
      output += `      Size: ${formatBytes(obj.Size || 0)}\n`;
      output += `      Last Modified: ${
        obj.LastModified?.toISOString() || "N/A"
      }\n`;
      output += `      Storage Class: ${obj.StorageClass || "STANDARD"}\n`;
      if (obj.Owner) {
        output += `      Owner: ${obj.Owner.DisplayName || obj.Owner.ID}\n`;
      }
      output += "\n";
    }

    // Add pagination info
    if (response.IsTruncated) {
      output += `⚠️  More objects available. Use continuation token: ${response.NextContinuationToken}\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output.trim(),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing objects: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
