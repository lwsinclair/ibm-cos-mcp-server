/**
 * Check if bucket exists and get metadata
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const HEAD_BUCKET: Tool = {
  name: 'ibm_cos_head_bucket',
  description:
    'Check if a bucket exists and retrieve its metadata. ' +
    'This operation is useful for verifying bucket existence without listing its contents.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket to check',
      },
    },
    required: ['bucketName'],
  },
};

export async function handleHeadBucket(args: any): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    await cosClient.headBucket({ Bucket: bucketName }).promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Bucket "${bucketName}" exists and is accessible.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error checking bucket: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
