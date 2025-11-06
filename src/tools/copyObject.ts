/**
 * Copy an object within COS
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const COPY_OBJECT: Tool = {
  name: 'ibm_cos_copy_object',
  description:
    'Copy an object from one location to another within IBM COS. ' +
    'Can copy within the same bucket or to a different bucket.',
  inputSchema: {
    type: 'object',
    properties: {
      sourceBucket: {
        type: 'string',
        description: 'Source bucket name',
      },
      sourceKey: {
        type: 'string',
        description: 'Source object key',
      },
      destinationBucket: {
        type: 'string',
        description: 'Destination bucket name',
      },
      destinationKey: {
        type: 'string',
        description: 'Destination object key',
      },
      metadata: {
        type: 'object',
        description: 'Custom metadata for the copied object (optional)',
        optional: true,
      },
      storageClass: {
        type: 'string',
        description:
          'Storage class for the copied object: STANDARD, VAULT, COLD, SMART (optional)',
        optional: true,
      },
    },
    required: ['sourceBucket', 'sourceKey', 'destinationBucket', 'destinationKey'],
  },
};

export async function handleCopyObject(args: any): Promise<CallToolResult> {
  try {
    const {
      sourceBucket,
      sourceKey,
      destinationBucket,
      destinationKey,
      metadata,
      storageClass,
    } = args;

    if (!sourceBucket || !sourceKey || !destinationBucket || !destinationKey) {
      throw new Error(
        'sourceBucket, sourceKey, destinationBucket, and destinationKey are required'
      );
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: destinationBucket,
      Key: destinationKey,
      CopySource: `${sourceBucket}/${sourceKey}`,
    };

    if (metadata) {
      params.Metadata = metadata;
      params.MetadataDirective = 'REPLACE';
    }

    if (storageClass) {
      params.StorageClass = storageClass;
    }

    const response = await cosClient.copyObject(params).promise();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Successfully copied object\n\n` +
            `From: ${sourceBucket}/${sourceKey}\n` +
            `To: ${destinationBucket}/${destinationKey}\n` +
            `ETag: ${response.CopyObjectResult?.ETag || 'N/A'}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error copying object: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
