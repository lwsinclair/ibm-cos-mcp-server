# IBM Cloud Object Storage MCP Server

A comprehensive, production-ready Model Context Protocol (MCP) server for IBM Cloud Object Storage. This server provides complete S3-compatible API access to IBM COS with 37 comprehensive tools covering all aspects of object storage management.

## Features

### 🚀 Complete S3 API Coverage

- **Bucket Operations**: Create, list, delete, and manage buckets with full configuration
- **Object Operations**: Upload, download, copy, delete single and multiple objects
- **Multipart Uploads**: Efficient handling of large files with parallel uploads
- **Lifecycle Management**: Automate object transitions and expiration
- **Versioning**: Track and manage object versions
- **CORS Configuration**: Enable cross-origin resource sharing
- **Access Control**: Manage bucket and object ACLs
- **Tagging**: Organize resources with key-value tags
- **CORS Configuration**: Enable cross-origin resource sharing
- **Website Hosting**: Configure static website hosting
- **Object Lock**: Immutable object storage for compliance
- **Encryption**: Server-side encryption with IBM Key Protect or SSE-C

### 🔐 Flexible Authentication

- **IAM API Key**: Recommended for production use
- **HMAC Credentials**: S3-compatible access key and secret
- Automatic credential refresh and token management

### 🌐 Network Flexibility

- Public endpoints for internet access
- Private endpoints for VPC/internal networks
- Direct endpoints for high-performance applications

### 📊 Advanced Features

- Comprehensive error handling and validation
- Detailed logging and debugging support
- Streaming support for large objects
- Automatic pagination for list operations
- Full TypeScript type safety

## Installation

```bash
npm install @kirtijha/ibm-cos-mcp-server
```

## Configuration

Create a `.env` file in your project root:

```bash
# Required: Service Instance ID
IBM_COS_SERVICE_INSTANCE_ID=your-service-instance-id

# Authentication Option 1: IAM API Key (Recommended)
IBM_COS_API_KEY=your-ibm-cloud-api-key

# Authentication Option 2: HMAC Credentials
# IBM_COS_ACCESS_KEY_ID=your-access-key-id
# IBM_COS_SECRET_ACCESS_KEY=your-secret-access-key

# Endpoint Configuration
IBM_COS_ENDPOINT=s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_REGION=us-south
```

### Getting Your Credentials

1. **Service Instance ID**: Found in your COS instance details in IBM Cloud Console
2. **IAM API Key**: Create in IBM Cloud Console → Manage → Access (IAM) → API Keys
3. **HMAC Credentials**: Create in COS instance → Service Credentials → New Credential (with HMAC enabled)

## Usage

### As MCP Server (with Claude Desktop)

Add to your Claude Desktop config:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ibm-cos": {
      "command": "node",
      "args": ["/path/to/ibm-cos-mcp-server/dist/index.js"],
      "env": {
        "IBM_COS_API_KEY": "your-api-key",
        "IBM_COS_SERVICE_INSTANCE_ID": "your-instance-id",
        "IBM_COS_ENDPOINT": "s3.us-south.cloud-object-storage.appdomain.cloud",
        "IBM_COS_REGION": "us-south"
      }
    }
  }
}
```

### As HTTP Server

```bash
# Start the HTTP server
npm run start:http
# or
ibm-cos-http-server
```

The server will be available at `http://localhost:3000` (or your configured PORT).

## Available Tools

### Bucket Management (7 tools)

1. **list_buckets** - List all buckets in your service instance
2. **create_bucket** - Create a new bucket with storage class and location
3. **delete_bucket** - Delete an empty bucket
4. **head_bucket** - Check bucket existence and get metadata
5. **get_bucket_location** - Get bucket's location constraint
6. **get_bucket_versioning** - Check versioning status
7. **put_bucket_versioning** - Enable/suspend versioning

### Object Operations (11 tools)

8. **list_objects** - List objects in a bucket (v1)
9. **list_objects_v2** - List objects with continuation tokens (v2)
10. **put_object** - Upload an object
11. **get_object** - Download an object
12. **head_object** - Get object metadata
13. **delete_object** - Delete a single object
14. **delete_objects** - Delete multiple objects in one request
15. **copy_object** - Copy objects between buckets
16. **get_object_tagging** - Get object tags
17. **put_object_tagging** - Set object tags
18. **delete_object_tagging** - Remove object tags

### Multipart Upload (6 tools)

19. **create_multipart_upload** - Initiate multipart upload
20. **upload_part** - Upload a part
21. **complete_multipart_upload** - Complete upload
22. **abort_multipart_upload** - Cancel upload
23. **list_multipart_uploads** - List active uploads
24. **list_parts** - List uploaded parts

### Access Control (4 tools)

25. **get_bucket_acl** - Get bucket ACL
26. **put_bucket_acl** - Set bucket ACL
27. **get_object_acl** - Get object ACL
28. **put_object_acl** - Set object ACL
33. **get_public_access_block** - Get public access settings
34. **put_public_access_block** - Configure public access

### Advanced Features (6 tools)

35. **get_bucket_cors** - Get CORS configuration
36. **put_bucket_cors** - Set CORS rules
37. **delete_bucket_cors** - Remove CORS configuration
38. **get_bucket_website** - Get website configuration
39. **put_bucket_website** - Configure static website
40. **delete_bucket_website** - Remove website configuration

### Replication & Protection (4 tools)

41. **get_bucket_replication** - Get replication configuration
42. **put_bucket_replication** - Configure replication
43. **delete_bucket_replication** - Remove replication
44. **get_bucket_protection** - Get immutable object storage config

## Examples

### Upload a File

```typescript
// The MCP server handles this automatically when you use:
// "Upload file.txt to my-bucket in IBM COS"
```

### Create a Bucket with Lifecycle Rules

```typescript
// 1. Create the bucket first
// "Create a bucket named 'archive-bucket' in us-south"

// 2. Then configure lifecycle rules
// "Set lifecycle rules for 'archive-bucket' to expire objects after 90 days"
```

### Configure CORS for Web Applications

```typescript
// "Configure CORS for 'my-app-bucket' to allow requests from https://myapp.com"
```

### Download and Process Objects

```typescript
// "List all PDF files in 'documents' bucket and download the latest one"
```

## Endpoints by Region

### US Regions

- `s3.us-south.cloud-object-storage.appdomain.cloud` (Dallas)
- `s3.us-east.cloud-object-storage.appdomain.cloud` (Washington DC)

### EU Regions

- `s3.eu-de.cloud-object-storage.appdomain.cloud` (Frankfurt)
- `s3.eu-gb.cloud-object-storage.appdomain.cloud` (London)

### AP Regions

- `s3.ap-south.cloud-object-storage.appdomain.cloud` (Tokyo)
- `s3.ap-north.cloud-object-storage.appdomain.cloud` (Seoul)

For private endpoints, replace `s3` with `s3.private`.  
For direct endpoints, replace `s3` with `s3.direct`.

## Architecture

```
ibm-cos-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server entry
│   ├── http-server.ts        # HTTP server entry
│   ├── server/
│   │   ├── http-server-base.ts
│   │   └── ibm-cos-http.ts
│   ├── tools/               # 37 tool implementations
│   │   ├── listBuckets.ts
│   │   ├── createBucket.ts
│   │   ├── putObject.ts
│   │   ├── getObject.ts
│   │   ├── ... (33 more tools)
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Shared utilities
└── dist/                    # Compiled JavaScript
```

## Error Handling

The server provides detailed error messages and handles:

- Authentication failures
- Invalid credentials
- Bucket/object not found
- Permission denied
- Network errors
- Malformed requests

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use IAM API Keys** - Recommended over HMAC credentials
3. **Enable versioning** - Protect against accidental deletions
4. **Configure lifecycle rules** - Automatically manage storage costs
5. **Use private endpoints** - For internal applications
6. **Enable encryption** - Use IBM Key Protect for sensitive data
7. **Implement least privilege** - Grant minimum required permissions

## Performance Tips

1. **Use multipart upload** - For files larger than 100MB
2. **Enable parallel uploads** - Upload parts concurrently
3. **Use direct endpoints** - For high-throughput applications
4. **Implement retry logic** - Handle transient failures
5. **Cache bucket locations** - Reduce API calls
6. **Use streaming** - For large object downloads

## Troubleshooting

### Connection Issues

- Verify endpoint is correct for your region
- Check network connectivity
- Ensure firewall allows HTTPS traffic

### Authentication Errors

- Verify API key is valid and not expired
- Check service instance ID is correct
- Ensure credentials have required permissions

### Permission Denied

- Verify IAM policies grant required access
- Check bucket policies and ACLs
- Ensure service instance is accessible

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes
npm run watch

# Start HTTP server in dev mode
npm run dev:http
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- GitHub Issues: [Report a bug](https://github.com/yourusername/ibm-cos-mcp-server/issues)
- IBM Cloud Docs: [Object Storage Documentation](https://cloud.ibm.com/docs/cloud-object-storage)
- API Reference: [S3 API Compatibility](https://cloud.ibm.com/apidocs/cos/cos-compatibility)

## Acknowledgments

Built with:

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [IBM COS SDK](https://github.com/IBM/ibm-cos-sdk-js)
- TypeScript and Node.js

---

**Made with ❤️ for the IBM Cloud community**
