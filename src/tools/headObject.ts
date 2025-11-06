/**
 * Get object metadata without downloading content
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const HEAD_OBJECT: Tool = {
  name: 'ibm_cos_head_object',
  description:
    'Retrieve metadata about an object without downloading its content. ' +
    'Returns content-type, size, ETag, last modified date, and custom metadata.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      key: {
        type: 'string',
        description: 'The key (name/path) of the object',
      },
      versionId: {
        type: 'string',
        description: 'Specific version ID (optional)',
        optional: true,
      },
    },
    required: ['bucketName', 'key'],
  },
};

export async function handleHeadObject(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, versionId } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
    };

    if (versionId) {
      params.VersionId = versionId;
    }

    const response = await cosClient.headObject(params).promise();

    let output =
      `📄 Object Metadata\n\n` +
      `Bucket: ${bucketName}\n` +
      `Key: ${key}\n` +
      `Size: ${response.ContentLength} bytes\n` +
      `Content-Type: ${response.ContentType || 'Not specified'}\n` +
      `ETag: ${response.ETag}\n` +
      `Last Modified: ${response.LastModified?.toISOString() || 'N/A'}\n`;

    if (response.VersionId) {
      output += `Version ID: ${response.VersionId}\n`;
    }

    if (response.StorageClass) {
      output += `Storage Class: ${response.StorageClass}\n`;
    }

    if (response.Metadata && Object.keys(response.Metadata).length > 0) {
      output += `\n📋 Custom Metadata:\n`;
      for (const [metaKey, metaValue] of Object.entries(response.Metadata)) {
        output += `  ${metaKey}: ${metaValue}\n`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting object metadata: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
