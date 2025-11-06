/**
 * Delete bucket CORS configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const DELETE_BUCKET_CORS: Tool = {
  name: 'ibm_cos_delete_bucket_cors',
  description:
    'Remove the CORS (Cross-Origin Resource Sharing) configuration from a bucket. ' +
    'This will block all cross-origin requests to the bucket.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
    },
    required: ['bucketName'],
  },
};

export async function handleDeleteBucketCors(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    await cosClient.deleteBucketCors({ Bucket: bucketName }).promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully deleted CORS configuration for bucket: ${bucketName}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting bucket CORS: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
