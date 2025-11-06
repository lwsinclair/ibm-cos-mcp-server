/**
 * Tool type definitions
 */

// Text content type
export interface TextContent {
  type: "text";
  text: string;
}

// Image content type
export interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
}

// Resource content type
export interface ResourceContent {
  type: "resource";
  resource: {
    uri: string;
    mimeType?: string;
    text?: string;
  };
}

// Union of all content types
export type ToolContent = TextContent | ImageContent | ResourceContent;

// Tool result interface matching MCP SDK expectations
export interface ToolResult {
  content: ToolContent[];
  isError?: boolean;
}
