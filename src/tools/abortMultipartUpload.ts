/**
 * Abort a multipart upload
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const ABORT_MULTIPART_UPLOAD: Tool = {
  name: 'ibm_cos_abort_multipart_upload',
  description:
    'Abort a multipart upload and free storage consumed by uploaded parts. ' +
    'Use this to cancel an incomplete upload and clean up resources.',
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
        description: 'The Upload ID to abort',
      },
    },
    required: ['bucketName', 'key', 'uploadId'],
  },
};

export async function handleAbortMultipartUpload(
  args: any
): Promise<CallToolResult> {
  try {
    const { bucketName, key, uploadId } = args;

    if (!bucketName || !key || !uploadId) {
      throw new Error('bucketName, key, and uploadId are required');
    }

    const cosClient = getCOSClient();

    await cosClient
      .abortMultipartUpload({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
      })
      .promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Multipart upload aborted successfully\n\n` +
            `Bucket: ${bucketName}\n` +
            `Key: ${key}\n` +
            `Upload ID: ${uploadId}\n\n` +
            `All uploaded parts have been freed.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error aborting multipart upload: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
