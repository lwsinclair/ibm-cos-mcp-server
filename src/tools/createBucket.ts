/**
 * Create a new bucket with specified configuration
 */

import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  getCOSClient,
  formatCOSError,
  validateBucketName,
  addServiceInstanceHeader,
} from "../utils/connection.js";

export const CREATE_BUCKET: Tool = {
  name: "ibm_cos_create_bucket",
  description:
    "Create a new bucket in IBM Cloud Object Storage. " +
    "Bucket names must be globally unique and DNS-compliant. " +
    "Specify location constraint to set storage class and region. " +
    "Supports Key Protect encryption for enhanced security.",
  inputSchema: {
    type: "object",
    properties: {
      bucketName: {
        type: "string",
        description:
          "Name of the bucket to create (3-63 chars, lowercase letters, numbers, dots, hyphens)",
      },
      locationConstraint: {
        type: "string",
        description:
          'Storage class and location (e.g., "us-south-standard", "eu-gb-smart-tier", "ap-geo-cold")',
        optional: true,
      },
      kmsKeyId: {
        type: "string",
        description: "IBM Key Protect CRN for encryption (optional)",
        optional: true,
      },
      acl: {
        type: "string",
        description: "Canned ACL to apply (private or public-read)",
        enum: ["private", "public-read"],
        optional: true,
      },
    },
    required: ["bucketName"],
  },
};

export async function handleCreateBucket(args: any): Promise<CallToolResult> {
  try {
    const { bucketName, locationConstraint, kmsKeyId, acl } = args;

    // Validate bucket name
    validateBucketName(bucketName);

    const cosClient = getCOSClient();

    const params: any = {
      Bucket: bucketName,
    };

    // Add service instance ID
    const serviceInstanceId = process.env.IBM_COS_SERVICE_INSTANCE_ID;
    if (serviceInstanceId) {
      params.IBMServiceInstanceId = serviceInstanceId;
    }

    // Add location constraint if provided
    if (locationConstraint) {
      params.CreateBucketConfiguration = {
        LocationConstraint: locationConstraint,
      };
    }

    // Add Key Protect encryption if provided
    if (kmsKeyId) {
      params.IBMSSEKPEncryptionAlgorithm = "AES256";
      params.IBMSSEKPCustomerRootKeyCrn = kmsKeyId;
    }

    // Add ACL if provided
    if (acl) {
      params.ACL = acl;
    }

    await cosClient.createBucket(params).promise();

    let output = `✅ Successfully created bucket: ${bucketName}\n\n`;
    output += `Details:\n`;
    output += `- Name: ${bucketName}\n`;

    if (locationConstraint) {
      output += `- Location: ${locationConstraint}\n`;
    }

    if (kmsKeyId) {
      output += `- Encryption: Enabled with Key Protect\n`;
    }

    if (acl) {
      output += `- ACL: ${acl}\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating bucket: ${formatCOSError(error)}`,
        },
      ],
      isError: true,
    };
  }
}
