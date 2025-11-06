/**
 * Get bucket lifecycle configuration
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_LIFECYCLE: Tool = {
  name: 'ibm_cos_get_bucket_lifecycle',
  description:
    'Retrieve the lifecycle configuration for a bucket. ' +
    'Shows automatic archiving, transition, and expiration rules.',
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

export async function handleGetBucketLifecycle(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketLifecycleConfiguration({ Bucket: bucketName })
      .promise();

    if (!response.Rules || response.Rules.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No lifecycle rules configured for bucket: ${bucketName}`,
          },
        ],
      };
    }

    let output = `🔄 Lifecycle Configuration\n\nBucket: ${bucketName}\n\n`;
    output += `Rules (${response.Rules.length}):\n\n`;

    response.Rules.forEach((rule, index) => {
      output += `${index + 1}. ${rule.ID || 'Unnamed rule'}\n`;
      output += `   Status: ${rule.Status}\n`;
      if (rule.Prefix) {
        output += `   Prefix: ${rule.Prefix}\n`;
      }
      if (rule.Transitions && rule.Transitions.length > 0) {
        output += `   Transitions:\n`;
        rule.Transitions.forEach((transition) => {
          output += `     - After ${transition.Days} days → ${transition.StorageClass}\n`;
        });
      }
      if (rule.Expiration) {
        if (rule.Expiration.Days) {
          output += `   Expiration: ${rule.Expiration.Days} days\n`;
        }
        if (rule.Expiration.Date) {
          output += `   Expiration Date: ${rule.Expiration.Date}\n`;
        }
      }
      if (rule.NoncurrentVersionExpiration) {
        output += `   Noncurrent Version Expiration: ${rule.NoncurrentVersionExpiration.NoncurrentDays} days\n`;
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
          text: `Error getting bucket lifecycle: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
