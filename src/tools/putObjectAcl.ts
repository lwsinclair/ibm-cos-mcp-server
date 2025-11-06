/**
 * Set object ACL (Access Control List)
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_OBJECT_ACL: Tool = {
  name: 'ibm_cos_put_object_acl',
  description:
    'Set the Access Control List (ACL) for an object. ' +
    'Use canned ACLs like "private" or "public-read" to control object access.',
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
      acl: {
        type: 'string',
        description: 'Canned ACL: "private", "public-read", "public-read-write", "authenticated-read"',
        enum: ['private', 'public-read', 'public-read-write', 'authenticated-read'],
        optional: true,
      },
    },
    required: ['bucketName', 'key'],
  },
};

export async function handlePutObjectAcl(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, acl } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
    };

    if (acl) {
      params.ACL = acl;
    } else {
      // Default to private
      params.ACL = 'private';
    }

    await cosClient.putObjectAcl(params).promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Successfully set ACL for object\n\n` +
            `Bucket: ${bucketName}\n` +
            `Key: ${key}\n` +
            `ACL: ${params.ACL}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error setting object ACL: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
