/**
 * Type definitions for IBM Cloud Object Storage
 */

export interface COSConfig {
  apiKeyId?: string;
  serviceInstanceId: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint: string;
  region?: string;
  forcePathStyle?: boolean;
}

export interface BucketInfo {
  Name: string;
  CreationDate: Date;
  LocationConstraint?: string;
}

export interface ObjectInfo {
  Key: string;
  LastModified: Date;
  ETag: string;
  Size: number;
  StorageClass: string;
  Owner?: {
    DisplayName: string;
    ID: string;
  };
}

export interface MultipartUpload {
  UploadId: string;
  Key: string;
  Initiated: Date;
  StorageClass: string;
  Owner?: {
    DisplayName: string;
    ID: string;
  };
}

export interface LifecycleRule {
  ID?: string;
  Status: "Enabled" | "Disabled";
  Prefix?: string;
  Filter?: {
    Prefix?: string;
    Tag?: { Key: string; Value: string };
    And?: {
      Prefix?: string;
      Tags?: Array<{ Key: string; Value: string }>;
    };
  };
  Transitions?: Array<{
    Date?: Date;
    Days?: number;
    StorageClass: string;
  }>;
  Expiration?: {
    Date?: Date;
    Days?: number;
    ExpiredObjectDeleteMarker?: boolean;
  };
  NoncurrentVersionTransitions?: Array<{
    NoncurrentDays: number;
    StorageClass: string;
  }>;
  NoncurrentVersionExpiration?: {
    NoncurrentDays: number;
  };
  AbortIncompleteMultipartUpload?: {
    DaysAfterInitiation: number;
  };
}

export interface ReplicationRule {
  ID?: string;
  Priority: number;
  Status: "Enabled" | "Disabled";
  Filter?: {
    Prefix?: string;
    Tag?: { Key: string; Value: string };
    And?: {
      Prefix?: string;
      Tags?: Array<{ Key: string; Value: string }>;
    };
  };
  Destination: {
    Bucket: string;
    StorageClass?: string;
  };
  DeleteMarkerReplication?: {
    Status: "Enabled" | "Disabled";
  };
}

export interface CORSRule {
  AllowedOrigins: string[];
  AllowedMethods: string[];
  AllowedHeaders?: string[];
  ExposeHeaders?: string[];
  MaxAgeSeconds?: number;
}

export interface WebsiteConfiguration {
  IndexDocument?: {
    Suffix: string;
  };
  ErrorDocument?: {
    Key: string;
  };
  RoutingRules?: Array<{
    Condition?: {
      HttpErrorCodeReturnedEquals?: string;
      KeyPrefixEquals?: string;
    };
    Redirect: {
      HostName?: string;
      HttpRedirectCode?: string;
      Protocol?: "http" | "https";
      ReplaceKeyPrefixWith?: string;
      ReplaceKeyWith?: string;
    };
  }>;
}

export interface Tag {
  Key: string;
  Value: string;
}

export interface Part {
  PartNumber: number;
  LastModified?: Date;
  ETag: string;
  Size?: number;
}

export interface ACL {
  Grants?: Array<{
    Grantee: {
      Type: string;
      ID?: string;
      DisplayName?: string;
      URI?: string;
      EmailAddress?: string;
    };
    Permission: string;
  }>;
  Owner?: {
    DisplayName?: string;
    ID: string;
  };
}

export interface PublicAccessBlockConfiguration {
  BlockPublicAcls?: boolean;
  IgnorePublicAcls?: boolean;
  BlockPublicPolicy?: boolean;
  RestrictPublicBuckets?: boolean;
}

export interface VersioningConfiguration {
  Status?: "Enabled" | "Suspended";
  MFADelete?: "Enabled" | "Disabled";
}

export interface ObjectVersion {
  Key: string;
  VersionId: string;
  IsLatest: boolean;
  LastModified: Date;
  Owner?: {
    DisplayName: string;
    ID: string;
  };
  ETag: string;
  Size: number;
  StorageClass: string;
}
