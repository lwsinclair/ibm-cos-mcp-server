/**
 * Upload a part in a multipart upload
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const UPLOAD_PART: Tool = {
  name: 'ibm_cos_upload_part',
  description:
    'Upload a part in a multipart upload. ' +
    'Each part must be at least 5MB except the last part. ' +
    'Save the ETag returned for completing the upload.',
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
      partNumber: {
        type: 'number',
        description: 'Part number (1-10000)',
      },
      body: {
        type: 'string',
        description: 'The data for this part (base64 encoded for binary data)',
      },
    },
    required: ['bucketName', 'key', 'uploadId', 'partNumber', 'body'],
  },
};

export async function handleUploadPart(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, key, uploadId, partNumber, body } = args;

    if (!bucketName || !key || !uploadId || !partNumber || !body) {
      throw new Error(
        'bucketName, key, uploadId, partNumber, and body are required'
      );
    }

    if (partNumber < 1 || partNumber > 10000) {
      throw new Error('partNumber must be between 1 and 10000');
    }

    const cosClient = getCOSClient();

    const response = await cosClient
      .uploadPart({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Part uploaded successfully\n\n` +
            `Bucket: ${bucketName}\n` +
            `Key: ${key}\n` +
            `Part Number: ${partNumber}\n` +
            `ETag: ${response.ETag}\n\n` +
            `⚠️ Important: Save this ETag for completing the upload.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error uploading part: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
