/**
 * Create a multipart upload
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const CREATE_MULTIPART_UPLOAD: Tool = {
  name: 'ibm_cos_create_multipart_upload',
  description:
    'Initiate a multipart upload for large files. ' +
    'Returns an UploadId that must be used in subsequent upload part operations. ' +
    'Use for files larger than 100MB or when uploading in chunks.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      key: {
        type: 'string',
        description: 'The key (name/path) for the object',
      },
      contentType: {
        type: 'string',
        description: 'MIME type of the object (optional)',
        optional: true,
      },
      metadata: {
        type: 'object',
        description: 'Custom metadata (optional)',
        optional: true,
      },
      storageClass: {
        type: 'string',
        description: 'Storage class: STANDARD, VAULT, COLD, SMART (optional)',
        optional: true,
      },
    },
    required: ['bucketName', 'key'],
  },
};

export async function handleCreateMultipartUpload(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key, contentType, metadata, storageClass } = args;

    if (!bucketName || !key) {
      throw new Error('bucketName and key are required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
      Key: key,
    };

    if (contentType) {
      params.ContentType = contentType;
    }

    if (metadata) {
      params.Metadata = metadata;
    }

    if (storageClass) {
      params.StorageClass = storageClass;
    }

    const response = await cosClient.createMultipartUpload(params).promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Multipart upload initiated\n\n` +
            `Bucket: ${bucketName}\n` +
            `Key: ${key}\n` +
            `Upload ID: ${response.UploadId}\n\n` +
            `⚠️ Important: Save this Upload ID for uploading parts and completing the upload.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating multipart upload: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
