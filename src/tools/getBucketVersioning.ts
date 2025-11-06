/**
 * Get bucket versioning configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_VERSIONING: Tool = {
  name: 'ibm_cos_get_bucket_versioning',
  description:
    'Get the versioning configuration of a bucket. ' +
    'Returns whether versioning is Enabled, Suspended, or not configured.',
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

export async function handleGetBucketVersioning(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketVersioning({ Bucket: bucketName })
      .promise();

    const status = response.Status || 'Not configured';
    const mfaDelete = response.MFADelete || 'Disabled';

    return {
      content: [
        {
          type: 'text',
          text:
            `🔄 Versioning Configuration\n\n` +
            `Bucket: ${bucketName}\n` +
            `Status: ${status}\n` +
            `MFA Delete: ${mfaDelete}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting bucket versioning: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
