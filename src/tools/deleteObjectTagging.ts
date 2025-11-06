/**
 * Delete object tagging
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const DELETE_OBJECT_TAGGING: Tool = {
  name: 'ibm_cos_delete_object_tagging',
  description:
    'Remove all tags from an object. ' +
    'This operation does not delete the object itself, only its tags.',
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

export async function handleDeleteObjectTagging(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    await cosClient
      .deleteObjectTagging({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully removed all tags from object\n\nBucket: ${bucketName}\nKey: ${key}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting object tagging: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
