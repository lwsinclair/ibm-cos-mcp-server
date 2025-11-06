/**
 * List all buckets in the service instance
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { getCOSClient, formatCOSError } from "../utils/connection.js";

export const LIST_BUCKETS: Tool = {
  name: "ibm_cos_list_buckets",
  description:
    "List all buckets in the IBM Cloud Object Storage service instance. " +
    "Returns bucket names, creation dates, and optionally location constraints. " +
    'Use the "extended" parameter to include provisioning codes and storage class information.',
  inputSchema: {
    type: "object",
    properties: {
      extended: {
        type: "boolean",
        description:
          "If true, includes LocationConstraint (provisioning code) for each bucket, allowing inference of location and endpoint",
        optional: true,
      },
    },
  },
};

export async function handleListBuckets(args: any): Promise<CallToolResult> {
  try {
    const cosClient = getCOSClient();
    const extended = args.extended || false;

    const params: any = {};

    // Add service instance ID header
    const serviceInstanceId = process.env.IBM_COS_SERVICE_INSTANCE_ID;
    if (serviceInstanceId) {
      params.IBMServiceInstanceId = serviceInstanceId;
    }

    const response = await cosClient.listBuckets(params).promise();

    if (!response.Buckets || response.Buckets.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No buckets found in this service instance.",
          },
        ],
      };
    }

    // Format the output
    let output = `Found ${response.Buckets.length} bucket(s):\n\n`;

    for (const bucket of response.Buckets) {
      output += `📦 ${bucket.Name}\n`;
      output += `   Created: ${bucket.CreationDate?.toISOString() || "N/A"}\n`;

      // If extended info is requested, get bucket location
      if (extended && bucket.Name) {
        try {
          const locationResponse = await cosClient
            .getBucketLocation({ Bucket: bucket.Name })
            .promise();

          if (locationResponse.LocationConstraint) {
            output += `   Location: ${locationResponse.LocationConstraint}\n`;
          }
        } catch (error) {
          // Skip if we can't get location
        }
      }

      output += "\n";
    }

    return {
      content: [
        {
          type: "text",
          text: output.trim(),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing buckets: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
