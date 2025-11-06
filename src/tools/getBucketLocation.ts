/**
 * Get bucket's location constraint
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_LOCATION: Tool = {
  name: 'ibm_cos_get_bucket_location',
  description:
    'Get the location constraint (region and storage class) of a bucket. ' +
    'Returns information like "us-south-standard" or "eu-gb-smart-tier".',
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

export async function handleGetBucketLocation(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketLocation({ Bucket: bucketName })
      .promise();

    const location = response.LocationConstraint || 'Not specified';

    return {
      content: [
        {
          type: 'text',
          text: `📍 Bucket Location\n\nBucket: ${bucketName}\nLocation Constraint: ${location}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting bucket location: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
