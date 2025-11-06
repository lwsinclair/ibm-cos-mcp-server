/**
 * Upload an object to a bucket
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { getCOSClient, formatCOSError } from "../utils/connection.js";

export const PUT_OBJECT: Tool = {
  name: "ibm_cos_put_object",
  description:
    "Upload an object to IBM Cloud Object Storage. " +
    "Supports metadata, tagging, and storage class configuration. " +
    "For files larger than 100MB, consider using multipart upload.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description: "Name of the bucket",
      },
      key: {
        type: "string",
        description: "Object key (name/path within bucket)",
      },
      body: {
        type: "string",
        description: "Object content (string or base64 for binary)",
      },
      contentType: {
        type: "string",
        description: 'MIME type of the object (e.g., "application/json")',
        optional: true,
      },
      metadata: {
        type: "object",
        description: "Custom metadata key-value pairs",
        optional: true,
      },
      tagging: {
        type: "string",
        description:
          'Tags as URL query parameters (e.g., "key1=value1&key2=value2")',
        optional: true,
      },
      storageClass: {
        type: "string",
        description: "Storage class for the object",
        enum: [
          "STANDARD",
          "REDUCED_REDUNDANCY",
          "GLACIER",
          "INTELLIGENT_TIERING",
        ],
        optional: true,
      },
      cacheControl: {
        type: "string",
        description: "Cache control header",
        optional: true,
      },
      contentDisposition: {
        type: "string",
        description: "Content disposition header",
        optional: true,
      },
      contentEncoding: {
        type: "string",
        description: "Content encoding header",
        optional: true,
      },
    },
    required: ["bucketName", "key", "body"],
  },
};

export async function handlePutObject(args: any): Promise<CallToolResult> {
  try {
    const {
      bucketName,
      key,
      body,
      contentType,
      metadata,
      tagging,
      storageClass,
      cacheControl,
      contentDisposition,
      contentEncoding,
    } = args;

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
      Body: body,
    };

    if (contentType) params.ContentType = contentType;
    if (metadata) params.Metadata = metadata;
    if (tagging) params.Tagging = tagging;
    if (storageClass) params.StorageClass = storageClass;
    if (cacheControl) params.CacheControl = cacheControl;
    if (contentDisposition) params.ContentDisposition = contentDisposition;
    if (contentEncoding) params.ContentEncoding = contentEncoding;

    const response = await cosClient.putObject(params).promise();

    let output = `✅ Successfully uploaded object\n\n`;
    output += `Details:\n`;
    output += `- Bucket: ${bucketName}\n`;
    output += `- Key: ${key}\n`;
    output += `- ETag: ${response.ETag}\n`;
    output += `- Size: ${body.length} bytes\n`;

    if (contentType) output += `- Content-Type: ${contentType}\n`;
    if (storageClass) output += `- Storage Class: ${storageClass}\n`;
    if (response.VersionId) output += `- Version ID: ${response.VersionId}\n`;

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
          text: `Error uploading object: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
