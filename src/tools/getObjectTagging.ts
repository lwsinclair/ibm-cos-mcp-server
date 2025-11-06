/**
 * Get object tagging
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_OBJECT_TAGGING: Tool = {
  name: 'ibm_cos_get_object_tagging',
  description:
    'Retrieve the tags associated with an object. ' +
    'Tags are key-value pairs used for organizing and categorizing objects.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      key: {
        type: 'string',
        description: 'The key (name/path) of the object',
      },
    },
    required: ['bucketName', 'key'],
  },
};

export async function handleGetObjectTagging(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getObjectTagging({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    let output = `🏷️ Object Tags\n\nBucket: ${bucketName}\nKey: ${key}\n\n`;

    if (response.TagSet && response.TagSet.length > 0) {
      output += `Tags (${response.TagSet.length}):\n`;
      response.TagSet.forEach((tag) => {
        output += `  ${tag.Key}: ${tag.Value}\n`;
      });
    } else {
      output += `No tags found for this object.`;
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
          text: `Error getting object tagging: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
