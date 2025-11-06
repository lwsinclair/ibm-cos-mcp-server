/**
 * Get bucket CORS configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_CORS: Tool = {
  name: 'ibm_cos_get_bucket_cors',
  description:
    'Get the CORS (Cross-Origin Resource Sharing) configuration for a bucket. ' +
    'Shows which origins, methods, and headers are allowed for cross-origin requests.',
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

export async function handleGetBucketCors(args: any): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketCors({ Bucket: bucketName })
      .promise();

    if (!response.CORSRules || response.CORSRules.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No CORS configuration found for bucket: ${bucketName}`,
          },
        ],
      };
    }

    let output = `🌐 CORS Configuration\n\nBucket: ${bucketName}\n\n`;
    output += `Rules (${response.CORSRules.length}):\n\n`;

    response.CORSRules.forEach((rule, index) => {
      output += `Rule ${index + 1}:\n`;
      output += `  Allowed Origins: ${rule.AllowedOrigins?.join(', ') || 'None'}\n`;
      output += `  Allowed Methods: ${rule.AllowedMethods?.join(', ') || 'None'}\n`;
      if (rule.AllowedHeaders) {
        output += `  Allowed Headers: ${rule.AllowedHeaders.join(', ')}\n`;
      }
      if (rule.ExposeHeaders) {
        output += `  Expose Headers: ${rule.ExposeHeaders.join(', ')}\n`;
      }
      if (rule.MaxAgeSeconds) {
        output += `  Max Age: ${rule.MaxAgeSeconds} seconds\n`;
      }
      output += `\n`;
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
          text: `Error getting bucket CORS: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
