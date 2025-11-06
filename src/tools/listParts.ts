/**
 * List parts of a multipart upload
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const LIST_PARTS: Tool = {
  name: 'ibm_cos_list_parts',
  description:
    'List parts that have been uploaded for a specific multipart upload. ' +
    'Shows part numbers, ETags, and sizes for each uploaded part.',
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
      uploadId: {
        type: 'string',
        description: 'The Upload ID',
      },
      maxParts: {
        type: 'number',
        description: 'Maximum number of parts to return (optional, default 1000)',
        optional: true,
      },
    },
    required: ['bucketName', 'key', 'uploadId'],
  },
};

export async function handleListParts(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, uploadId, maxParts } = args;

    if (!bucketName || !key || !uploadId) {
      throw new Error('bucketName, key, and uploadId are required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
    };

    if (maxParts) {
      params.MaxParts = maxParts;
    }

    const response = await cosClient.listParts(params).promise();

    if (!response.Parts || response.Parts.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No parts uploaded yet for this multipart upload.\n\nBucket: ${bucketName}\nKey: ${key}\nUpload ID: ${uploadId}`,
          },
        ],
      };
    }

    let output = `📦 Uploaded Parts\n\n`;
    output += `Bucket: ${bucketName}\n`;
    output += `Key: ${key}\n`;
    output += `Upload ID: ${uploadId}\n`;
    output += `Storage Class: ${response.StorageClass || 'N/A'}\n\n`;
    output += `Parts (${response.Parts.length}):\n\n`;

    let totalSize = 0;
    response.Parts.forEach((part) => {
      output += `Part ${part.PartNumber}:\n`;
      output += `  ETag: ${part.ETag}\n`;
      output += `  Size: ${part.Size} bytes\n`;
      output += `  Last Modified: ${part.LastModified?.toISOString() || 'N/A'}\n\n`;
      totalSize += part.Size || 0;
    });

    output += `Total size: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`;

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
          text: `Error listing parts: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
