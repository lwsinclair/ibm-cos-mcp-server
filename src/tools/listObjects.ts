/**
 * List objects in a bucket (v1 API)
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCOSClient, formatCOSError } from '../utils/connection.js';

export const LIST_OBJECTS: Tool = {
  name: 'ibm_cos_list_objects',
  description:
    'List objects in a bucket using the v1 API. ' +
    'Supports prefix filtering, delimiter for folder-like structure, and pagination with marker. ' +
    'Use list_objects_v2 for new implementations as it has better performance.',
  inputSchema: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'The name of the bucket',
      },
      prefix: {
        type: 'string',
        description: 'Limit results to keys that begin with this prefix (optional)',
        optional: true,
      },
      delimiter: {
        type: 'string',
        description: 'Delimiter for grouping keys (e.g., "/" for folders) - optional',
        optional: true,
      },
      maxKeys: {
        type: 'number',
        description: 'Maximum number of keys to return (optional, default 1000)',
        optional: true,
      },
      marker: {
        type: 'string',
        description: 'Start listing from this key (for pagination) - optional',
        optional: true,
      },
    },
    required: ['bucketName'],
  },
};

export async function handleListObjects(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, prefix, delimiter, maxKeys, marker } = args;

    if (!bucketName) {
      throw new Error('bucketName is required');
    }

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
    };

    if (prefix) {
      params.Prefix = prefix;
    }

    if (delimiter) {
      params.Delimiter = delimiter;
    }

    if (maxKeys) {
      params.MaxKeys = maxKeys;
    }

    if (marker) {
      params.Marker = marker;
    }

    const response = await cosClient.listObjects(params).promise();

    if (
      (!response.Contents || response.Contents.length === 0) &&
      (!response.CommonPrefixes || response.CommonPrefixes.length === 0)
    ) {
      return {
        content: [
          {
            type: 'text',
            text: `No objects found in bucket: ${bucketName}${prefix ? ` with prefix: ${prefix}` : ''}`,
          },
        ],
      };
    }

    let output = `📦 Objects in ${bucketName}\n\n`;

    if (prefix) {
      output += `Prefix: ${prefix}\n`;
    }

    if (response.Contents && response.Contents.length > 0) {
      output += `\nObjects (${response.Contents.length}):\n\n`;

      response.Contents.forEach((obj) => {
        const sizeInMB = ((obj.Size || 0) / 1024 / 1024).toFixed(2);
        output += `📄 ${obj.Key}\n`;
        output += `   Size: ${sizeInMB} MB\n`;
        output += `   Modified: ${obj.LastModified?.toISOString() || 'N/A'}\n`;
        if (obj.StorageClass) {
          output += `   Storage Class: ${obj.StorageClass}\n`;
        }
        output += `\n`;
      });
    }

    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      output += `\nFolders (${response.CommonPrefixes.length}):\n`;
      response.CommonPrefixes.forEach((prefix) => {
        output += `📁 ${prefix.Prefix}\n`;
      });
    }

    if (response.IsTruncated) {
      output += `\n⚠️ More objects available. Use marker="${response.NextMarker}" to continue.`;
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
          text: `Error listing objects: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
