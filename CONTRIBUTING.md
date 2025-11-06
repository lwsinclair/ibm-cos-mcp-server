# Contributing to IBM Cloud Object Storage MCP Server

Thank you for your interest in contributing to the IBM Cloud Object Storage MCP Server! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Contribution Requirements](#contribution-requirements)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

We accept the following types of contributions:

- Bug fixes
- New tools and features
- Documentation improvements
- Performance improvements
- Test coverage improvements
- Code quality improvements
- Security enhancements

## Contribution Requirements

All contributions must meet the following requirements to be accepted:

### 1. Code Quality Standards

- **TypeScript**: All code must be written in TypeScript with strict type checking enabled
- **ESLint**: Code must pass ESLint checks (run `npm run lint` if available)
- **No TypeScript errors**: Code must compile without errors (`npm run build`)
- **Formatting**: Code should follow consistent formatting (we recommend Prettier)

### 2. Coding Standards

#### Code Style
- Use meaningful variable and function names
- Follow existing code patterns and architecture
- Add JSDoc comments for public functions and complex logic
- Use async/await instead of raw promises where possible
- Handle errors appropriately with try-catch blocks

#### Example Code Pattern for Tools
```typescript
/**
 * Lists all buckets in the IBM COS instance
 * @param args - Tool arguments containing optional extended flag
 * @returns List of buckets with names, creation dates, and optional location info
 * @throws Error if COS credentials are invalid or API call fails
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_buckets",
      description: "List all buckets in the IBM COS service instance",
      inputSchema: {
        type: "object",
        properties: {
          extended: {
            type: "boolean",
            description: "Include location constraints and provisioning codes",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Validate tool name
    if (name === "list_buckets") {
      // Input validation
      const extended = args?.extended === true;

      // Make API call
      const response = await s3.listBuckets().promise();

      // Process and return results
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.Buckets, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    // Sanitized error handling
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});
```

### 3. Security Requirements

- **No hardcoded credentials**: Use environment variables for all sensitive data
- **Input validation**: Validate and sanitize all user inputs
- **Error handling**: Don't expose sensitive information in error messages
- **Dependencies**: Keep dependencies up to date and audit regularly

#### Security Checklist
- [ ] No credentials in code
- [ ] All user inputs validated (bucket names, object keys, etc.)
- [ ] Error messages sanitized (no credential exposure)
- [ ] Dependencies audited (`npm audit`)
- [ ] IBM COS credentials stored in environment variables only

### 4. Documentation Requirements

- Update README.md if adding new features
- Add JSDoc comments for new functions
- Update TOOLS.md for new tools
- Document environment variables required
- Include usage examples

### 5. Testing Requirements

While automated tests are being developed, please perform thorough manual testing:

#### Manual Testing Checklist
- [ ] Test with valid IBM COS credentials
- [ ] Test with invalid/missing credentials
- [ ] Test each new tool with various inputs
- [ ] Test error handling with invalid inputs
- [ ] Test edge cases (empty buckets, large objects, special characters)
- [ ] Test in both stdio and HTTP modes
- [ ] Verify no sensitive data in logs

#### Test in stdio mode:
```bash
npm run build
export IBM_COS_ENDPOINT="https://s3.us-south.cloud-object-storage.appdomain.cloud"
export IBM_COS_API_KEY="your-api-key"
export IBM_COS_INSTANCE_ID="your-instance-id"
node dist/index.js
```

#### Test in HTTP mode:
```bash
export IBM_COS_ENDPOINT="https://s3.us-south.cloud-object-storage.appdomain.cloud"
export IBM_COS_API_KEY="your-api-key"
export IBM_COS_INSTANCE_ID="your-instance-id"
export MCP_API_KEY="test-key"
npm run start:http

# Test with curl
curl -X POST http://localhost:3001/tools/list \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key"
```

## Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+
- IBM Cloud Account with Cloud Object Storage instance
- IBM Cloud API Key
- Git

### Setup Steps

1. **Fork and Clone**
```bash
git clone https://github.com/IBM/ibm-cos-mcp-server.git
cd ibm-cos-mcp-server
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment**
```bash
# Create .env file (don't commit this!)
cat > .env << EOF
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=your_api_key_here
IBM_COS_INSTANCE_ID=your_instance_id_here
MCP_API_KEY=your_mcp_api_key  # For HTTP mode
EOF
```

4. **Build the Project**
```bash
npm run build
```

5. **Test Locally**
```bash
# stdio mode
node dist/index.js

# HTTP mode
npm run start:http
```

## Coding Standards

### TypeScript Guidelines

#### Type Safety
- Use explicit types for function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes
- Enable strict mode in tsconfig.json

```typescript
// Good
interface BucketInfo {
  name: string;
  creationDate: Date;
  locationConstraint?: string;
}

async function listBuckets(extended: boolean): Promise<BucketInfo[]> {
  // Implementation
}

// Bad
async function listBuckets(extended: any): Promise<any> {
  // Implementation
}
```

#### Error Handling
- Always handle errors in async functions
- Use custom error types when appropriate
- Don't expose sensitive data in error messages

```typescript
// Good
try {
  const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return data.Body?.toString('utf-8');
} catch (error) {
  if (error.code === 'NoSuchKey') {
    throw new Error(`Object not found: ${key}`);
  }
  throw new Error(`Failed to retrieve object: ${error.message}`);
}

// Bad
try {
  const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return data.Body?.toString('utf-8');
} catch (error) {
  throw error; // Might expose credentials or internal details
}
```

### IBM COS SDK Best Practices

- Use the official `ibm-cos-sdk` package
- Implement proper error handling for all S3 operations
- Use streaming for large objects
- Handle pagination for list operations
- Implement retry logic for transient failures

### MCP Server Guidelines

- Follow MCP protocol specifications
- Use proper tool schemas with clear descriptions
- Validate tool inputs before processing
- Return structured, consistent responses
- Include helpful error messages

## Pull Request Process

### Before Submitting

1. **Update your fork**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
   - Write clear, focused commits
   - Follow the coding standards above
   - Test thoroughly

4. **Commit with sign-off** (DCO requirement)
```bash
git add .
git commit -s -m "feat: add new feature description"
```

### Commit Message Format

Follow Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature or tool
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
git commit -s -m "feat(tools): add bucket lifecycle configuration tool"
git commit -s -m "fix(http): resolve CORS issue in HTTP mode"
git commit -s -m "docs: update bucket creation examples"
git commit -s -m "perf(upload): optimize multipart upload chunk size"
```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Clear description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] New tool
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Changes Made
- List key changes
- One per line

## Tools Added/Modified
- List any new or modified tools
- Include tool names and descriptions

## Testing
- [ ] Manual testing completed
- [ ] Tested in stdio mode
- [ ] Tested in HTTP mode
- [ ] Tested with real IBM COS instance
- [ ] No TypeScript errors
- [ ] ESLint passes (if applicable)

## Documentation
- [ ] README updated (if needed)
- [ ] TOOLS.md updated (for new tools)
- [ ] JSDoc comments added
- [ ] Examples updated (if needed)
- [ ] SETUP_GUIDE.md updated (if needed)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No hardcoded credentials
- [ ] Commit messages follow convention
- [ ] DCO sign-off included

Signed-off-by: Your Name <your.email@example.com>
```

### PR Review Process

1. **Automated Checks**: PRs must pass all automated checks
2. **Code Review**: At least one maintainer must review and approve
3. **Testing**: Reviewers will test the changes with real IBM COS
4. **Feedback**: Address any requested changes
5. **Merge**: Once approved, maintainers will merge the PR

## Reporting Issues

### Before Creating an Issue

- Check if the issue already exists
- Verify it's not a configuration problem
- Test with the latest version
- Check SETUP_GUIDE.md for common issues

### Issue Template

When creating an issue, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the problem
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - OS and version
   - Node.js version
   - Package version
   - MCP client (VS Code, Claude, etc.)
6. **IBM COS Configuration**:
   - Region/endpoint being used
   - Storage class (if relevant)
   - Whether using Key Protect (if relevant)
7. **Logs**: Relevant error messages or logs (remove sensitive data!)
8. **Additional Context**: Any other relevant information

### Example Issue

```markdown
**Description**
The `upload_object` tool fails when uploading files larger than 5MB.

**Steps to Reproduce**
1. Configure MCP server with valid IBM COS credentials
2. Call `upload_object` with a 10MB file
3. Observe error

**Expected Behavior**
File should be uploaded successfully, possibly using multipart upload automatically.

**Actual Behavior**
Returns error: "Request entity too large"

**Environment**
- OS: macOS 14.0
- Node.js: v20.10.0
- Package: @kirtijha/ibm-cos-mcp-server@1.0.0
- Client: VS Code with MCP extension

**IBM COS Configuration**
- Region: us-south
- Endpoint: s3.us-south.cloud-object-storage.appdomain.cloud
- Storage class: Standard

**Logs**
```
Error uploading object: Request entity too large
    at S3.putObject (node_modules/ibm-cos-sdk/lib/services/s3.js:...)
```

**Additional Context**
Files under 5MB upload successfully. Issue only occurs with larger files.
```

### Security Issues

**Do not open public issues for security vulnerabilities.**

Please report security issues privately to the maintainers. See [SECURITY.md](SECURITY.md) for details on how to report security vulnerabilities.

## Getting Help

- **Documentation**: Check the [README.md](README.md), [SETUP_GUIDE.md](SETUP_GUIDE.md), and [TOOLS.md](TOOLS.md)
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions and ideas
- **IBM Cloud Docs**: Check [IBM Cloud Object Storage documentation](https://cloud.ibm.com/docs/cloud-object-storage)

## Recognition

Contributors will be recognized in our release notes and repository. We appreciate all contributions, big and small!

## License

By contributing to IBM Cloud Object Storage MCP Server, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making IBM Cloud Object Storage MCP Server better! 🎉
