/**
 * Configure bucket lifecycle rules
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_BUCKET_LIFECYCLE: Tool = {
  name: 'ibm_cos_put_bucket_lifecycle',
  description:
    'Configure lifecycle rules for automatic object archiving, transition, and expiration. ' +
    'Use this to automatically move objects to cheaper storage classes or delete them after a specified time. ' +
    'Critical for cost optimization and data management.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      rules: {
        type: 'array',
        description:
          'Array of lifecycle rules with ID, Status, Prefix, Transitions, Expiration',
        items: {
          type: 'object',
        },
      },
    },
    required: ['bucketName', 'rules'],
  },
};

export async function handlePutBucketLifecycle(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, rules } = args;

    if (!bucketName || !rules || !Array.isArray(rules)) {
      throw new Error('bucketName and rules array are required');
    }

    const cosClient = getCOSClient();

    await cosClient
      .putBucketLifecycleConfiguration({
        Bucket: bucketName,
        LifecycleConfiguration: {
          Rules: rules,
        },
      })
      .promise();

    let output = `✅ Successfully configured lifecycle rules for bucket: ${bucketName}\n\n`;
    output += `Rules configured: ${rules.length}\n\n`;
    rules.forEach((rule: any, index: number) => {
      output += `${index + 1}. ${rule.ID || 'Unnamed rule'}: ${rule.Status || 'Enabled'}\n`;
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
          text: `Error setting bucket lifecycle: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
