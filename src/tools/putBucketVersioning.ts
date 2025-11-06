/**
 * Configure bucket versioning
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_BUCKET_VERSIONING: Tool = {
  name: 'ibm_cos_put_bucket_versioning',
  description:
    'Enable or suspend versioning on a bucket. ' +
    'Versioning allows you to keep multiple variants of an object in the same bucket.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      status: {
        type: 'string',
        description: 'Versioning status: "Enabled" or "Suspended"',
        enum: ['Enabled', 'Suspended'],
      },
    },
    required: ['bucketName', 'status'],
  },
};

export async function handlePutBucketVersioning(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, status } = args;

    if (!bucketName || !status) {
      throw new Error('bucketName and status are required');
    }

    if (status !== 'Enabled' && status !== 'Suspended') {
      throw new Error('status must be either "Enabled" or "Suspended"');
    }

    const cosClient = getCOSClient();

    await cosClient
      .putBucketVersioning({
        Bucket: bucketName,
        VersioningConfiguration: {
          Status: status,
        },
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully ${status.toLowerCase()} versioning for bucket: ${bucketName}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error setting bucket versioning: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
