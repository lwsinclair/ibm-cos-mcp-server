/**
 * Delete bucket website configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const DELETE_BUCKET_WEBSITE: Tool = {
  name: 'ibm_cos_delete_bucket_website',
  description:
    'Remove static website hosting configuration from a bucket. ' +
    'The bucket will no longer serve as a static website.',
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

export async function handleDeleteBucketWebsite(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    await cosClient.deleteBucketWebsite({ Bucket: bucketName }).promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully deleted website configuration for bucket: ${bucketName}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting bucket website: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
