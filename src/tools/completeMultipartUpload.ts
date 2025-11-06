/**
 * Complete a multipart upload
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const COMPLETE_MULTIPART_UPLOAD: Tool = {
  name: 'ibm_cos_complete_multipart_upload',
  description:
    'Complete a multipart upload by assembling previously uploaded parts. ' +
    'Provide the UploadId and an array of parts with their ETags.',
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
      uploadId: {
        type: 'string',
        description: 'The Upload ID from createMultipartUpload',
      },
      parts: {
        type: 'array',
        description:
          'Array of parts with PartNumber and ETag (e.g., [{"PartNumber": 1, "ETag": "etag1"}, {"PartNumber": 2, "ETag": "etag2"}])',
        items: {
          type: 'object',
          properties: {
            PartNumber: {
              type: 'number',
            },
            ETag: {
              type: 'string',
            },
          },
        },
      },
    },
    required: ['bucketName', 'key', 'uploadId', 'parts'],
  },
};

export async function handleCompleteMultipartUpload(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key, uploadId, parts } = args;

    if (!bucketName || !key || !uploadId || !parts || !Array.isArray(parts)) {
      throw new Error('bucketName, key, uploadId, and parts array are required');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .completeMultipartUpload({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Multipart upload completed successfully!\n\n` +
            `Bucket: ${bucketName}\n` +
            `Key: ${key}\n` +
            `Location: ${response.Location}\n` +
            `ETag: ${response.ETag}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error completing multipart upload: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
