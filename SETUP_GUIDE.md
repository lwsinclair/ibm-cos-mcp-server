# IBM Cloud Object Storage MCP Server - Setup Guide

This guide will walk you through setting up the IBM Cloud Object Storage MCP Server from scratch.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- IBM Cloud account
- IBM Cloud Object Storage service instance

## Step 1: Create IBM Cloud Object Storage Instance

1. Log in to [IBM Cloud Console](https://cloud.ibm.com)
2. Navigate to **Catalog** → **Storage** → **Object Storage**
3. Click **Create** and configure:
   - **Service name**: Choose a name (e.g., "my-cos-instance")
   - **Resource group**: Select or create
   - **Plan**: Choose Lite (free) or Standard
4. Click **Create**

## Step 2: Get Your Credentials

### Method 1: IAM API Key (Recommended)

1. In IBM Cloud Console, go to **Manage** → **Access (IAM)**
2. Click **API keys** in the left menu
3. Click **Create an IBM Cloud API key**
4. Give it a name (e.g., "COS-MCP-Server")
5. Click **Create** and **Copy** the API key
   - **Important**: Save this key securely - you can't view it again!

### Method 2: HMAC Credentials

1. In your COS instance, click **Service credentials**
2. Click **New credential**
3. Configure:
   - **Name**: "HMAC-Credentials"
   - **Role**: Writer or Manager
   - **Advanced options**: Check "Include HMAC Credential"
4. Click **Add**
5. Expand the credential and copy:
   - `access_key_id`
   - `secret_access_key`

## Step 3: Get Service Instance ID

1. In your COS instance dashboard
2. Look for **Service Instance ID** or **GUID**
3. Copy this value (format: `d6f76k03-6k4f-4a82-n165-697654o63903`)

## Step 4: Choose Your Endpoint

Endpoints vary by region and network type:

### Public Endpoints (Internet Access)

- US South: `s3.us-south.cloud-object-storage.appdomain.cloud`
- US East: `s3.us-east.cloud-object-storage.appdomain.cloud`
- EU Germany: `s3.eu-de.cloud-object-storage.appdomain.cloud`
- EU UK: `s3.eu-gb.cloud-object-storage.appdomain.cloud`

### Private Endpoints (VPC/Internal)

- Replace `s3` with `s3.private`
- Example: `s3.private.us-south.cloud-object-storage.appdomain.cloud`

### Direct Endpoints (High Performance)

- Replace `s3` with `s3.direct`
- Example: `s3.direct.us-south.cloud-object-storage.appdomain.cloud`

See [full endpoint list](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-endpoints)

## Step 5: Install the MCP Server

```bash
# Clone or download the repository
cd /path/to/ibm-cos-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Step 6: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Service Instance ID (Required)
IBM_COS_SERVICE_INSTANCE_ID=your-instance-id-here

# Authentication - Choose ONE method:

# Method 1: IAM API Key (Recommended)
IBM_COS_API_KEY=your-ibm-cloud-api-key

# Method 2: HMAC Credentials
# IBM_COS_ACCESS_KEY_ID=your-access-key-id
# IBM_COS_SECRET_ACCESS_KEY=your-secret-access-key

# Endpoint Configuration (Required)
IBM_COS_ENDPOINT=s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_REGION=us-south

# Optional Settings
# IBM_COS_FORCE_PATH_STYLE=true
# PORT=3000
```

## Step 7: Test Your Configuration

### Test with Node.js

Create a test file `test-connection.js`:

```javascript
require("dotenv").config();
const AWS = require("ibm-cos-sdk");

const config = {
  endpoint: process.env.IBM_COS_ENDPOINT,
  apiKeyId: process.env.IBM_COS_API_KEY,
  serviceInstanceId: process.env.IBM_COS_SERVICE_INSTANCE_ID,
};

const cosClient = new AWS.S3(config);

cosClient.listBuckets((err, data) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Success! Buckets:", data.Buckets);
  }
});
```

Run it:

```bash
node test-connection.js
```

## Step 8: Configure Claude Desktop

### MacOS Configuration

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ibm-cos": {
      "command": "node",
      "args": ["/Users/your-username/path-to/ibm-cos-mcp-server/dist/index.js"],
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

### Windows Configuration

Edit: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ibm-cos": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\path-to\\ibm-cos-mcp-server\\dist\\index.js"
      ],
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

## Step 9: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Restart Claude Desktop
3. Check the status bar - you should see IBM COS connected

## Step 10: Test in Claude

Try these commands:

```
List all my IBM COS buckets
```

```
Create a bucket named "test-bucket-123" in us-south
```

```
Upload a file to my bucket
```

## Alternative: Run as HTTP Server

Instead of using with Claude Desktop, you can run as a standalone HTTP server:

```bash
# Start the server
npm run start:http

# Or in development mode
npm run dev:http
```

The server will be available at:

- HTTP API: `http://localhost:3000`
- Health Check: `http://localhost:3000/health`
- SSE Endpoint: `http://localhost:3000/sse`

## Troubleshooting

### "Cannot connect to IBM COS"

**Check**:

- Service Instance ID is correct
- API key or HMAC credentials are valid
- Endpoint matches your region
- Network connectivity to IBM Cloud

**Solution**:

```bash
# Test connection
curl https://s3.us-south.cloud-object-storage.appdomain.cloud
```

### "Access Denied"

**Check**:

- API key has correct permissions
- Service instance ID matches the credentials
- IAM policies grant COS access

**Solution**:

1. Go to IBM Cloud Console
2. Navigate to **Manage** → **Access (IAM)** → **Service IDs**
3. Verify the API key has Manager or Writer role
4. Add COS service access if missing

### "NoSuchBucket"

**Check**:

- Bucket name is spelled correctly
- Bucket exists in your service instance
- You're using the correct endpoint for the bucket's region

**Solution**:

```bash
# List buckets to verify
curl -X GET "https://s3.us-south.cloud-object-storage.appdomain.cloud/" \
  -H "Authorization: Bearer $IAM_TOKEN" \
  -H "ibm-service-instance-id: $SERVICE_INSTANCE_ID"
```

### "Invalid Bucket Name"

Bucket names must:

- Be 3-63 characters long
- Use only lowercase letters, numbers, dots, hyphens
- Start and end with letter or number
- Not be formatted as IP address
- Not contain consecutive dots

### "SignatureDoesNotMatch"

This means authentication is failing.

**Check**:

- API key is copied correctly (no extra spaces)
- HMAC credentials match
- Using the right authentication method

### Claude Desktop Not Seeing Server

**Check**:

1. Config file path is correct
2. JSON is valid (use JSONLint.com)
3. Node path is correct (`which node`)
4. Server builds successfully (`npm run build`)

**Debug**:

```bash
# Run manually to see errors
node /path/to/ibm-cos-mcp-server/dist/index.js
```

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use IAM API keys** - More secure than HMAC
3. **Rotate credentials** regularly
4. **Use least privilege** - Grant minimum required permissions
5. **Use private endpoints** for production applications
6. **Enable versioning** on critical buckets
7. **Set up lifecycle rules** to manage costs
8. **Monitor access** with IBM Cloud Activity Tracker

## Next Steps

- Read [TOOLS.md](./TOOLS.md) for complete tool reference
- Check [README.md](./README.md) for usage examples
- Visit [IBM COS Documentation](https://cloud.ibm.com/docs/cloud-object-storage)
- Explore [IBM COS API Reference](https://cloud.ibm.com/apidocs/cos/cos-compatibility)

## Getting Help

- **IBM Cloud Support**: https://cloud.ibm.com/unifiedsupport
- **IBM Cloud Docs**: https://cloud.ibm.com/docs/cloud-object-storage
- **GitHub Issues**: [Report a bug or request feature]

## Additional Resources

- [IBM COS Pricing](https://www.ibm.com/cloud/object-storage/pricing)
- [IBM Key Protect](https://cloud.ibm.com/docs/key-protect)
- [IBM Activity Tracker](https://cloud.ibm.com/docs/activity-tracker)
- [S3 API Compatibility](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-compatibility-api)

---

**Congratulations!** You're now ready to use IBM Cloud Object Storage with Claude and the MCP Server. 🎉
