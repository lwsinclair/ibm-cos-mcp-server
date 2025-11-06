/**
 * Set bucket ACL (Access Control List)
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const PUT_BUCKET_ACL: Tool = {
  name: 'ibm_cos_put_bucket_acl',
  description:
    'Set the Access Control List (ACL) for a bucket. ' +
    'Use canned ACLs like "private" or "public-read", or provide detailed access control policy.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      acl: {
        type: 'string',
        description: 'Canned ACL: "private", "public-read", "public-read-write", "authenticated-read"',
        enum: ['private', 'public-read', 'public-read-write', 'authenticated-read'],
        optional: true,
      },
    },
    required: ['bucketName'],
  },
};

export async function handlePutBucketAcl(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, acl } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
    };

    if (acl) {
      params.ACL = acl;
    } else {
      // Default to private
      params.ACL = 'private';
    }

    await cosClient.putBucketAcl(params).promise();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully set ACL for bucket: ${bucketName}\n\nACL: ${params.ACL}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error setting bucket ACL: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
