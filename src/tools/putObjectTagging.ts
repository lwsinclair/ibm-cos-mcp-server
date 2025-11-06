/**
 * Set object tagging
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_OBJECT_TAGGING: Tool = {
  name: 'ibm_cos_put_object_tagging',
  description:
    'Set or replace the tags for an object. ' +
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
      tags: {
        type: 'object',
        description: 'Tags as key-value pairs (e.g., {"Environment": "Production", "Team": "Engineering"})',
      },
    },
    required: ['bucketName', 'key', 'tags'],
  },
};

export async function handlePutObjectTagging(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key, tags } = args;

    if (!bucketName || !key || !tags) {
      throw new Error('bucketName, key, and tags are required');
    }

    const cosClient = getCOSClient();

    // Convert tags object to TagSet array
    const tagSet = Object.entries(tags).map(([tagKey, tagValue]) => ({
      Key: tagKey,
      Value: String(tagValue),
    }));

    await cosClient
      .putObjectTagging({
        Bucket: bucketName,
        Key: key,
        Tagging: {
          TagSet: tagSet,
        },
      })
      .promise();

    let output = `✅ Successfully set tags for object\n\n`;
    output += `Bucket: ${bucketName}\n`;
    output += `Key: ${key}\n\n`;
    output += `Tags (${tagSet.length}):\n`;
    tagSet.forEach((tag) => {
      output += `  ${tag.Key}: ${tag.Value}\n`;
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
          text: `Error setting object tagging: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
