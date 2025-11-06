/**
 * Configure bucket as static website
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_BUCKET_WEBSITE: Tool = {
  name: 'ibm_cos_put_bucket_website',
  description:
    'Configure a bucket to host a static website. ' +
    'Specify index document and optional error document for static website hosting.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      indexDocument: {
        type: 'string',
        description: 'Index document key (e.g., "index.html")',
      },
      errorDocument: {
        type: 'string',
        description: 'Error document key (e.g., "error.html") - optional',
        optional: true,
      },
    },
    required: ['bucketName', 'indexDocument'],
  },
};

export async function handlePutBucketWebsite(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, indexDocument, errorDocument } = args;

    if (!bucketName || !indexDocument) {
      throw new Error('bucketName and indexDocument are required');
    }

    const cosClient = getCOSClient();

    const websiteConfig: any = {
      IndexDocument: {
        Suffix: indexDocument,
      },
    };

    if (errorDocument) {
      websiteConfig.ErrorDocument = {
        Key: errorDocument,
      };
    }

    await cosClient
      .putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: websiteConfig,
      })
      .promise();

    let output = `✅ Successfully configured static website hosting\n\n`;
    output += `Bucket: ${bucketName}\n`;
    output += `Index Document: ${indexDocument}\n`;
    if (errorDocument) {
      output += `Error Document: ${errorDocument}\n`;
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
          text: `Error setting bucket website: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
