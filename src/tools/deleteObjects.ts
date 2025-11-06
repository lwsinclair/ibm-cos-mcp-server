/**
 * Delete multiple objects in a single request
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const DELETE_OBJECTS: Tool = {
  name: 'ibm_cos_delete_objects',
  description:
    'Delete multiple objects from a bucket in a single request. ' +
    'Can delete up to 1000 objects at once.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      keys: {
        type: 'array',
        description: 'Array of object keys to delete',
        items: {
          type: 'string',
        },
      },
      quiet: {
        type: 'boolean',
        description:
          'If true, only returns errors. If false, returns all deleted objects (optional)',
        optional: true,
      },
    },
    required: ['bucketName', 'keys'],
  },
};

export async function handleDeleteObjects(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, keys, quiet } = args;

    if (!bucketName || !keys || !Array.isArray(keys) || keys.length === 0) {
      throw new Error('bucketName and non-empty keys array are required');
    }

    if (keys.length > 1000) {
      throw new Error('Cannot delete more than 1000 objects at once');
    }

    const cosClient = getCOSClient();

    const objects = keys.map((key: string) => ({ Key: key }));

    const response = await cosClient
      .deleteObjects({
        Bucket: bucketName,
        Delete: {
          Objects: objects,
          Quiet: quiet || false,
        },
      })
      .promise();

    let output = `🗑️ Bulk Delete Results\n\n`;
    output += `Bucket: ${bucketName}\n`;
    output += `Requested: ${keys.length} objects\n`;

    if (response.Deleted && response.Deleted.length > 0) {
      output += `✅ Deleted: ${response.Deleted.length} objects\n\n`;
      if (!quiet) {
        output += `Deleted objects:\n`;
        response.Deleted.forEach((item) => {
          output += `  - ${item.Key}\n`;
          if (item.DeleteMarker) {
            output += `    (Delete marker: ${item.DeleteMarkerVersionId})\n`;
          }
        });
      }
    }

    if (response.Errors && response.Errors.length > 0) {
      output += `\n❌ Errors: ${response.Errors.length}\n`;
      response.Errors.forEach((error) => {
        output += `  - ${error.Key}: ${error.Code} - ${error.Message}\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
      isError: response.Errors && response.Errors.length > 0,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting objects: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
