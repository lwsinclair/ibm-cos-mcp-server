/**
 * Get object ACL (Access Control List)
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_OBJECT_ACL: Tool = {
  name: 'ibm_cos_get_object_acl',
  description:
    'Get the Access Control List (ACL) for an object. ' +
    'Shows the owner and permissions granted to other users/groups.',
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

export async function handleGetObjectAcl(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getObjectAcl({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    let output = `🔐 Object ACL\n\nBucket: ${bucketName}\nKey: ${key}\n\n`;
    output += `Owner: ${response.Owner?.DisplayName || response.Owner?.ID || 'Unknown'}\n\n`;

    if (response.Grants && response.Grants.length > 0) {
      output += `Grants (${response.Grants.length}):\n`;
      response.Grants.forEach((grant, index) => {
        output += `\n${index + 1}. Permission: ${grant.Permission}\n`;
        if (grant.Grantee?.DisplayName) {
          output += `   Grantee: ${grant.Grantee.DisplayName}\n`;
        } else if (grant.Grantee?.ID) {
          output += `   Grantee ID: ${grant.Grantee.ID}\n`;
        } else if (grant.Grantee?.URI) {
          output += `   Grantee URI: ${grant.Grantee.URI}\n`;
        }
      });
    } else {
      output += `No grants found.`;
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
          text: `Error getting object ACL: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
