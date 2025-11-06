/**
 * Delete bucket lifecycle configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const DELETE_BUCKET_LIFECYCLE: Tool = {
  name: 'ibm_cos_delete_bucket_lifecycle',
  description:
    'Remove all lifecycle rules from a bucket. ' +
    'Objects will no longer be automatically archived, transitioned, or expired.',
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

export async function handleDeleteBucketLifecycle(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    await cosClient
      .deleteBucketLifecycle({ Bucket: bucketName })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully deleted lifecycle configuration for bucket: ${bucketName}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting bucket lifecycle: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
