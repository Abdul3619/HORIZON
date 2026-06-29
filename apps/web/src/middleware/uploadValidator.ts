// apps/web/src/middleware/uploadValidator.ts
// Secure Upload Validator verifying mime-types and real file headers (magic bytes).

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
}

// Map of MIME types to acceptable Magic Bytes signatures (in hexadecimal)
const MAGIC_BYTES_MAP: Record<string, { hex: string; offset: number }[]> = {
  'image/jpeg': [
    { hex: 'ffd8ff', offset: 0 }
  ],
  'image/png': [
    { hex: '89504e470d0a1a0a', offset: 0 }
  ],
  'image/webp': [
    { hex: '52494646', offset: 0 }, // "RIFF"
    { hex: '57454250', offset: 8 }  // "WEBP"
  ],
  'application/pdf': [
    { hex: '25504446', offset: 0 }  // "%PDF"
  ],
};

/**
 * Validates a file's mime type and inspects its binary header "magic bytes"
 * to detect extension spoofing and file masquerading attacks.
 * 
 * @param fileBuffer The binary representation of the uploaded file.
 * @param claimedMimeType The MIME type reported by the client browser.
 */
export async function validateUpload(
  fileBuffer: Buffer | ArrayBuffer,
  claimedMimeType: string
): Promise<ValidationResult> {
  const bytes = new Uint8Array(fileBuffer);
  
  if (bytes.length === 0) {
    return { isValid: false, error: 'File is empty (0 bytes).' };
  }

  // 1. Strict Allowed Mime Type Check
  const expectedSignatures = MAGIC_BYTES_MAP[claimedMimeType];
  if (!expectedSignatures) {
    return { 
      isValid: false, 
      error: `Unsupported MIME type: ${claimedMimeType}. Only JPEG, PNG, WEBP, and PDF files are allowed.` 
    };
  }

  // 2. Magic Bytes Inspection
  for (const sig of expectedSignatures) {
    const hexLength = sig.hex.length / 2;
    const slice = bytes.slice(sig.offset, sig.offset + hexLength);
    const hexString = Array.from(slice)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hexString !== sig.hex.toLowerCase()) {
      return {
        isValid: false,
        error: `Security Alert: File signature mismatch! The file claims to be '${claimedMimeType}', but actual binary headers do not match.`
      };
    }
  }

  // 3. File Size Gate (e.g., maximum 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (bytes.length > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File exceeds maximum payload limit of 10MB. Got: ${(bytes.length / (1024 * 1024)).toFixed(2)}MB.`
    };
  }

  return {
    isValid: true,
    mimeType: claimedMimeType
  };
}
