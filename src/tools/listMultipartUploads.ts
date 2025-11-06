/**
 * List multipart uploads in progress
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const LIST_MULTIPART_UPLOADS: Tool = {
  name: 'ibm_cos_list_multipart_uploads',
  description:
    'List in-progress multipart uploads in a bucket. ' +
    'Useful for finding incomplete uploads that can be completed or aborted.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      prefix: {
        type: 'string',
        description: 'List only uploads for keys beginning with this prefix (optional)',
        optional: true,
      },
      maxUploads: {
        type: 'number',
        description: 'Maximum number of uploads to return (optional, default 1000)',
        optional: true,
      },
    },
    required: ['bucketName'],
  },
};

export async function handleListMultipartUploads(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, prefix, maxUploads } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
    };

    if (prefix) {
      params.Prefix = prefix;
    }

    if (maxUploads) {
      params.MaxUploads = maxUploads;
    }

    const response = await cosClient.listMultipartUploads(params).promise();

    if (!response.Uploads || response.Uploads.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No in-progress multipart uploads found in bucket: ${bucketName}`,
          },
        ],
      };
    }

    let output = `📤 In-Progress Multipart Uploads\n\nBucket: ${bucketName}\n\n`;
    output += `Found ${response.Uploads.length} upload(s):\n\n`;

    response.Uploads.forEach((upload, index) => {
      output += `${index + 1}. Key: ${upload.Key}\n`;
      output += `   Upload ID: ${upload.UploadId}\n`;
      output += `   Initiated: ${upload.Initiated?.toISOString() || 'N/A'}\n`;
      output += `   Storage Class: ${upload.StorageClass || 'N/A'}\n\n`;
    });

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
          text: `Error listing multipart uploads: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
