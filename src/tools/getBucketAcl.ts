/**
 * Get bucket ACL (Access Control List)
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const GET_BUCKET_ACL: Tool = {
  name: 'ibm_cos_get_bucket_acl',
  description:
    'Get the Access Control List (ACL) for a bucket. ' +
    'Shows the owner and permissions granted to other users/groups.',
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

export async function handleGetBucketAcl(args: any): Promise<CallToolResult> {
  try {
    const { bucketName } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .getBucketAcl({ Bucket: bucketName })
      .promise();

    let output = `🔐 Bucket ACL\n\nBucket: ${bucketName}\n\n`;
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
          text: `Error getting bucket ACL: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
