/**
 * Set bucket CORS configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_BUCKET_CORS: Tool = {
  name: 'ibm_cos_put_bucket_cors',
  description:
    'Set the CORS (Cross-Origin Resource Sharing) configuration for a bucket. ' +
    'Define which origins can access bucket resources from web browsers.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      corsRules: {
        type: 'array',
        description:
          'Array of CORS rules with AllowedOrigins, AllowedMethods, etc.',
        items: {
          type: 'object',
        },
      },
    },
    required: ['bucketName', 'corsRules'],
  },
};

export async function handlePutBucketCors(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, corsRules } = args;

    if (!bucketName || !corsRules || !Array.isArray(corsRules)) {
      throw new Error('bucketName and corsRules array are required');
    }

    const cosClient = getCOSClient();

    await cosClient
      .putBucketCors({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: corsRules,
        },
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully set CORS configuration for bucket: ${bucketName}\n\nRules configured: ${corsRules.length}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error setting bucket CORS: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
