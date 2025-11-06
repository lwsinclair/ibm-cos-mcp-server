/**
 * Get bucket website configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_WEBSITE: Tool = {
  name: 'ibm_cos_get_bucket_website',
  description:
    'Get the static website hosting configuration for a bucket. ' +
    'Returns index and error document settings.',
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

export async function handleGetBucketWebsite(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketWebsite({ Bucket: bucketName })
      .promise();

    let output = `🌐 Website Configuration\n\nBucket: ${bucketName}\n\n`;

    if (response.IndexDocument) {
      output += `Index Document: ${response.IndexDocument.Suffix}\n`;
    }

    if (response.ErrorDocument) {
      output += `Error Document: ${response.ErrorDocument.Key}\n`;
    }

    if (response.RedirectAllRequestsTo) {
      output += `\nRedirect All Requests To:\n`;
      output += `  Host: ${response.RedirectAllRequestsTo.HostName}\n`;
      if (response.RedirectAllRequestsTo.Protocol) {
        output += `  Protocol: ${response.RedirectAllRequestsTo.Protocol}\n`;
      }
    }

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
          text: `Error getting bucket website: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
