# IBM COS MCP Server - Complete Tools Reference

This document provides a comprehensive reference for all 44 tools available in the IBM Cloud Object Storage MCP Server.

## Table of Contents

- [Bucket Management (10 tools)](#bucket-management)
- [Object Operations (12 tools)](#object-operations)
- [Multipart Upload (6 tools)](#multipart-upload)
- [Access Control (6 tools)](#access-control)
- [Advanced Features (6 tools)](#advanced-features)
- [Replication & Protection (4 tools)](#replication--protection)

---

## Bucket Management

### 1. list_buckets

**Purpose**: List all buckets in the service instance

**Parameters**:

- `extended` (boolean, optional): Include location constraints

**Example Usage**:

```
List all my IBM COS buckets with their locations
```

**Returns**: Bucket names, creation dates, and optional location info

---

### 2. create_bucket

**Purpose**: Create a new bucket

**Parameters**:

- `bucketName` (string, required): Bucket name (3-63 chars, DNS-compliant)
- `locationConstraint` (string, optional): Storage class (e.g., "us-south-standard")
- `kmsKeyId` (string, optional): Key Protect CRN for encryption
- `acl` (string, optional): "private" or "public-read"

**Example Usage**:

```
Create a bucket named "my-data-backup" in us-south with standard storage
```

---

### 3. delete_bucket

**Purpose**: Delete an empty bucket

**Parameters**:

- `bucketName` (string, required): Name of bucket to delete

**Example Usage**:

```
Delete the bucket named "old-test-bucket"
```

**Note**: Bucket must be empty before deletion

---

### 4. head_bucket

**Purpose**: Check if bucket exists and get metadata

**Parameters**:

- `bucketName` (string, required): Bucket to check

**Example Usage**:

```
Check if bucket "my-data" exists
```

**Returns**: Bucket existence, region, and metadata

---

### 5. get_bucket_location

**Purpose**: Get bucket's location constraint

**Parameters**:

- `bucketName` (string, required): Bucket name

**Returns**: Location constraint (e.g., "us-south-standard")

---

### 6. put_bucket_lifecycle

**Purpose**: Configure lifecycle rules

**Parameters**:

- `bucketName` (string, required)
- `rules` (array, required): Lifecycle rules

**Example Rule**:

```json
{
  "ID": "ArchiveOldFiles",
  "Status": "Enabled",
  "Transitions": [
    {
      "Days": 90,
      "StorageClass": "GLACIER"
    }
  ],
  "Expiration": {
    "Days": 365
  }
}
```

---

### 7. get_bucket_lifecycle

**Purpose**: Get current lifecycle configuration

**Parameters**:

- `bucketName` (string, required)

**Returns**: Active lifecycle rules

---

### 8. delete_bucket_lifecycle

**Purpose**: Remove all lifecycle rules

**Parameters**:

- `bucketName` (string, required)

---

### 9. put_bucket_versioning

**Purpose**: Enable or suspend versioning

**Parameters**:

- `bucketName` (string, required)
- `status` (string, required): "Enabled" or "Suspended"

**Example Usage**:

```
Enable versioning on bucket "important-data"
```

---

### 10. get_bucket_versioning

**Purpose**: Check versioning status

**Parameters**:

- `bucketName` (string, required)

**Returns**: "Enabled", "Suspended", or not configured

---

## Object Operations

### 11. list_objects

**Purpose**: List objects in a bucket (v1)

**Parameters**:

- `bucketName` (string, required)
- `prefix` (string, optional): Filter by prefix
- `delimiter` (string, optional): Delimiter for grouping
- `maxKeys` (number, optional): Max objects to return (default 1000)
- `marker` (string, optional): Start listing from this key

**Example Usage**:

```
List all PDF files in bucket "documents" (prefix="*.pdf")
```

---

### 12. list_objects_v2

**Purpose**: List objects with continuation token (v2)

**Parameters**:

- `bucketName` (string, required)
- `prefix` (string, optional)
- `maxKeys` (number, optional)
- `continuationToken` (string, optional): For pagination
- `startAfter` (string, optional): Start after this key

**Example Usage**:

```
List objects in "media" bucket starting with "videos/"
```

---

### 13. put_object

**Purpose**: Upload an object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required): Object name/path
- `body` (string/buffer, required): Object content
- `contentType` (string, optional): MIME type
- `metadata` (object, optional): Custom metadata
- `tagging` (string, optional): Tags as URL query params
- `storageClass` (string, optional): Storage class

**Example Usage**:

```
Upload file "report.pdf" to bucket "documents" with content-type "application/pdf"
```

---

### 14. get_object

**Purpose**: Download an object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `range` (string, optional): Byte range (e.g., "bytes=0-1023")
- `ifModifiedSince` (date, optional): Conditional download

**Example Usage**:

```
Download "data.json" from "backups" bucket
```

**Returns**: Object content and metadata

---

### 15. head_object

**Purpose**: Get object metadata without downloading

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)

**Returns**: Content-type, size, ETag, last modified, metadata

---

### 16. delete_object

**Purpose**: Delete a single object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `versionId` (string, optional): Specific version to delete

**Example Usage**:

```
Delete file "old-data.csv" from "archives" bucket
```

---

### 17. delete_objects

**Purpose**: Delete multiple objects in one request

**Parameters**:

- `bucketName` (string, required)
- `keys` (array, required): List of object keys to delete
- `quiet` (boolean, optional): Return only errors

**Example Usage**:

```
Delete all objects with prefix "temp/" from bucket "workspace"
```

**Note**: Can delete up to 1000 objects per request

---

### 18. copy_object

**Purpose**: Copy object within or between buckets

**Parameters**:

- `sourceBucket` (string, required)
- `sourceKey` (string, required)
- `destinationBucket` (string, required)
- `destinationKey` (string, required)
- `metadataDirective` (string, optional): "COPY" or "REPLACE"

**Example Usage**:

```
Copy "logo.png" from "assets" bucket to "public" bucket
```

---

### 19. restore_object

**Purpose**: Restore archived object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `days` (number, required): Days to keep restored copy

**Example Usage**:

```
Restore "backup-2023.tar.gz" from Glacier for 7 days
```

---

### 20. get_object_tagging

**Purpose**: Get object tags

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)

**Returns**: Array of {Key, Value} pairs

---

### 21. put_object_tagging

**Purpose**: Set object tags

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `tags` (array, required): [{Key, Value}]

**Example Usage**:

```
Tag "report.pdf" with {"Department": "Finance", "Year": "2024"}
```

---

### 22. delete_object_tagging

**Purpose**: Remove all tags from object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)

---

## Multipart Upload

### 23. create_multipart_upload

**Purpose**: Initiate multipart upload for large files

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `contentType` (string, optional)
- `metadata` (object, optional)

**Returns**: UploadId to use for subsequent operations

**Example Usage**:

```
Start multipart upload for "large-video.mp4" to "media" bucket
```

---

### 24. upload_part

**Purpose**: Upload a part

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `uploadId` (string, required)
- `partNumber` (number, required): 1-10000
- `body` (buffer, required): Part data

**Returns**: ETag to use in complete request

---

### 25. upload_part_copy

**Purpose**: Copy part from existing object

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `uploadId` (string, required)
- `partNumber` (number, required)
- `copySource` (string, required): "bucket/key"
- `copySourceRange` (string, optional): Byte range

---

### 26. complete_multipart_upload

**Purpose**: Complete multipart upload

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `uploadId` (string, required)
- `parts` (array, required): [{PartNumber, ETag}]

**Example Usage**:

```
Complete multipart upload for "large-file.zip" with 5 parts
```

---

### 27. abort_multipart_upload

**Purpose**: Cancel multipart upload

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `uploadId` (string, required)

---

### 28. list_multipart_uploads

**Purpose**: List active multipart uploads

**Parameters**:

- `bucketName` (string, required)
- `prefix` (string, optional)
- `maxUploads` (number, optional)

**Returns**: Active uploads with UploadId and metadata

---

## Access Control

### 29. get_bucket_acl

**Purpose**: Get bucket ACL

**Parameters**:

- `bucketName` (string, required)

**Returns**: Grants and owner information

---

### 30. put_bucket_acl

**Purpose**: Set bucket ACL

**Parameters**:

- `bucketName` (string, required)
- `acl` (string, optional): Canned ACL
- `accessControlPolicy` (object, optional): Detailed grants

---

### 31. get_object_acl

**Purpose**: Get object ACL

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)

---

### 32. put_object_acl

**Purpose**: Set object ACL

**Parameters**:

- `bucketName` (string, required)
- `key` (string, required)
- `acl` (string, optional): "private" or "public-read"

**Example Usage**:

```
Make "public/logo.png" publicly readable
```

---

### 33. get_public_access_block

**Purpose**: Get public access block configuration

**Parameters**:

- `bucketName` (string, required)

---

### 34. put_public_access_block

**Purpose**: Configure public access blocking

**Parameters**:

- `bucketName` (string, required)
- `blockPublicAcls` (boolean, optional)
- `ignorePublicAcls` (boolean, optional)
- `blockPublicPolicy` (boolean, optional)
- `restrictPublicBuckets` (boolean, optional)

---

## Advanced Features

### 35. get_bucket_cors

**Purpose**: Get CORS configuration

**Parameters**:

- `bucketName` (string, required)

---

### 36. put_bucket_cors

**Purpose**: Set CORS rules

**Parameters**:

- `bucketName` (string, required)
- `corsRules` (array, required)

**Example Rule**:

```json
{
  "AllowedOrigins": ["https://example.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

---

### 37. delete_bucket_cors

**Purpose**: Remove CORS configuration

**Parameters**:

- `bucketName` (string, required)

---

### 38. get_bucket_website

**Purpose**: Get static website configuration

**Parameters**:

- `bucketName` (string, required)

---

### 39. put_bucket_website

**Purpose**: Configure static website hosting

**Parameters**:

- `bucketName` (string, required)
- `indexDocument` (string, required): e.g., "index.html"
- `errorDocument` (string, optional): e.g., "error.html"

---

### 40. delete_bucket_website

**Purpose**: Remove website configuration

**Parameters**:

- `bucketName` (string, required)

---

## Replication & Protection

### 41. get_bucket_replication

**Purpose**: Get replication configuration

**Parameters**:

- `bucketName` (string, required)

---

### 42. put_bucket_replication

**Purpose**: Configure cross-region replication

**Parameters**:

- `bucketName` (string, required)
- `rules` (array, required): Replication rules

**Example Rule**:

```json
{
  "ID": "ReplicateAll",
  "Status": "Enabled",
  "Priority": 1,
  "Destination": {
    "Bucket": "arn:aws:s3:::backup-bucket"
  }
}
```

---

### 43. delete_bucket_replication

**Purpose**: Remove replication configuration

**Parameters**:

- `bucketName` (string, required)

---

### 44. get_bucket_protection

**Purpose**: Get immutable object storage configuration

**Parameters**:

- `bucketName` (string, required)

**Returns**: Retention policy details

---

## Storage Classes

Available storage classes for buckets:

- **Standard**: Frequently accessed data
- **Smart Tier**: Automatic cost optimization
- **Cold Vault**: Infrequently accessed data
- **Flex**: Flexible pricing model

### Regional Classes

- `us-south-standard`, `us-east-standard`
- `eu-de-standard`, `eu-gb-standard`
- `ap-south-standard`, `ap-north-standard`

### Cross-Region Classes

- `us-geo-standard`, `eu-geo-standard`, `ap-geo-standard`

---

## Best Practices

1. **Use multipart upload** for files > 100MB
2. **Enable versioning** for critical data
3. **Set lifecycle rules** to manage costs
4. **Use private endpoints** for internal apps
5. **Tag resources** for organization and billing
6. **Configure CORS** only when needed
7. **Monitor bucket size** with listing operations
8. **Use smart tier** for unpredictable access patterns

---

## Error Handling

All tools return structured error responses:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error description with helpful context"
    }
  ],
  "isError": true
}
```

Common error codes:

- `NoSuchBucket`: Bucket doesn't exist
- `NoSuchKey`: Object not found
- `AccessDenied`: Insufficient permissions
- `BucketNotEmpty`: Can't delete non-empty bucket
- `InvalidBucketName`: Invalid bucket name format
