/**
 * IBM Cloud Object Storage Connection Utility
 */

import AWS from "ibm-cos-sdk";
import { COSConfig } from "../types/cos.js";

let cosClient: AWS.S3 | null = null;

/**
 * Creates and returns an IBM COS S3 client
 */
export function createCOSClient(config?: COSConfig): AWS.S3 {
  if (cosClient) {
    return cosClient;
  }

  // Get configuration from environment variables or provided config
  const apiKeyId = config?.apiKeyId || process.env.IBM_COS_API_KEY;
  const serviceInstanceId =
    config?.serviceInstanceId || process.env.IBM_COS_SERVICE_INSTANCE_ID;
  const accessKeyId = config?.accessKeyId || process.env.IBM_COS_ACCESS_KEY_ID;
  const secretAccessKey =
    config?.secretAccessKey || process.env.IBM_COS_SECRET_ACCESS_KEY;
  const endpoint = config?.endpoint || process.env.IBM_COS_ENDPOINT;
  const region = config?.region || process.env.IBM_COS_REGION || "us-south";
  const forcePathStyle =
    config?.forcePathStyle ||
    process.env.IBM_COS_FORCE_PATH_STYLE === "true" ||
    false;

  // Validate required configuration
  if (!serviceInstanceId) {
    throw new Error(
      "IBM_COS_SERVICE_INSTANCE_ID is required. Please set it in your environment variables."
    );
  }

  if (!endpoint) {
    throw new Error(
      "IBM_COS_ENDPOINT is required. Please set it in your environment variables."
    );
  }

  // Validate authentication method
  if (!apiKeyId && (!accessKeyId || !secretAccessKey)) {
    throw new Error(
      "Either IBM_COS_API_KEY or both IBM_COS_ACCESS_KEY_ID and IBM_COS_SECRET_ACCESS_KEY are required."
    );
  }

  try {
    // Create the S3 client configuration
    const s3Config: any = {
      endpoint: endpoint,
      apiKeyId: apiKeyId || undefined,
      serviceInstanceId: serviceInstanceId,
      signatureVersion: "iam",
    };

    // Set credentials based on authentication method
    if (apiKeyId) {
      // Using IAM API Key - IBM COS SDK handles this automatically
      console.error("Connecting to IBM COS using IAM API Key authentication");
    } else if (accessKeyId && secretAccessKey) {
      // Using HMAC credentials
      s3Config.credentials = new AWS.Credentials({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      });
      s3Config.signatureVersion = "v4";

      console.error("Connecting to IBM COS using HMAC credentials");
    }

    // Create the S3 client
    cosClient = new AWS.S3(s3Config);

    console.error(`Connected to IBM COS at ${endpoint}`);

    return cosClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to create IBM COS client:", errorMessage);
    throw new Error(`Failed to connect to IBM COS: ${errorMessage}`);
  }
}

/**
 * Gets the existing COS client or creates a new one
 */
export function getCOSClient(): AWS.S3 {
  if (!cosClient) {
    return createCOSClient();
  }
  return cosClient;
}

/**
 * Resets the COS client (useful for testing or credential updates)
 */
export function resetCOSClient(): void {
  cosClient = null;
}

/**
 * Formats COS errors into user-friendly messages
 */
export function formatCOSError(error: any): string {
  if (error.code) {
    switch (error.code) {
      case "NoSuchBucket":
        return `Bucket not found: ${error.message}`;
      case "NoSuchKey":
        return `Object not found: ${error.message}`;
      case "BucketAlreadyExists":
        return `Bucket name already exists: ${error.message}`;
      case "BucketAlreadyOwnedByYou":
        return `You already own this bucket: ${error.message}`;
      case "AccessDenied":
        return `Access denied: ${error.message}. Check your credentials and permissions.`;
      case "InvalidAccessKeyId":
        return `Invalid access key: ${error.message}`;
      case "SignatureDoesNotMatch":
        return `Authentication failed: ${error.message}. Check your credentials.`;
      case "BucketNotEmpty":
        return `Bucket is not empty: ${error.message}. Delete all objects first.`;
      case "NoSuchUpload":
        return `Multipart upload not found: ${error.message}`;
      case "EntityTooLarge":
        return `Object is too large: ${error.message}`;
      case "InvalidBucketName":
        return `Invalid bucket name: ${error.message}`;
      case "InvalidObjectState":
        return `Invalid object state: ${error.message}. The object may be archived.`;
      case "MethodNotAllowed":
        return `Method not allowed: ${error.message}`;
      case "PreconditionFailed":
        return `Precondition failed: ${error.message}`;
      case "SlowDown":
        return `Request throttled: ${error.message}. Please slow down your requests.`;
      default:
        return `IBM COS Error (${error.code}): ${error.message}`;
    }
  }

  return error.message || String(error);
}

/**
 * Validates bucket name according to S3 naming rules
 */
export function validateBucketName(bucketName: string): void {
  if (!bucketName || bucketName.length < 3 || bucketName.length > 63) {
    throw new Error("Bucket name must be between 3 and 63 characters long");
  }

  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucketName)) {
    throw new Error(
      "Bucket name must start and end with a lowercase letter or number, and can only contain lowercase letters, numbers, dots, and hyphens"
    );
  }

  if (/\.\./.test(bucketName)) {
    throw new Error("Bucket name cannot contain consecutive dots");
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(bucketName)) {
    throw new Error("Bucket name cannot be formatted as an IP address");
  }

  if (bucketName.startsWith("xn--")) {
    throw new Error('Bucket name cannot start with "xn--"');
  }

  if (bucketName.endsWith("-s3alias")) {
    throw new Error('Bucket name cannot end with "-s3alias"');
  }
}

/**
 * Adds IBM service instance ID header to request
 */
export function addServiceInstanceHeader(
  params: any,
  serviceInstanceId?: string
): any {
  const instanceId =
    serviceInstanceId || process.env.IBM_COS_SERVICE_INSTANCE_ID;

  if (instanceId && params) {
    return {
      ...params,
      Metadata: {
        ...params.Metadata,
        "ibm-service-instance-id": instanceId,
      },
    };
  }

  return params;
}
