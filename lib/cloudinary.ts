export const MEDIA_FOLDERS = [
  "hero",
  "about",
  "achievements",
  "services",
  "facilities",
  "quality",
  "projects",
  "offices",
  "branding",
  "general",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadSignatureResponse {
  cloudName: string;
  uploadPreset: string;
  folder: string;
  signed: boolean;
  timestamp?: number;
  signature?: string;
  apiKey?: string;
}

export interface UploadedMediaResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  folder: string;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Unsupported file format. Please upload JPG, PNG, WebP, AVIF, GIF, or SVG.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large. Maximum allowed image size is 10 MB.";
  }
  return null;
}

export function optimizeImageUrl(url: string | null | undefined, width?: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) {
    return url;
  }
  // Avoid double-inserting transformations
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const prefix = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  if (rest.startsWith("f_auto") || rest.startsWith("q_auto")) {
    return url;
  }
  const transforms = width ? `f_auto,q_auto,w_${width},c_limit` : "f_auto,q_auto";
  return `${prefix}${transforms}/${rest}`;
}

export async function uploadImageAsset(
  file: File,
  folder: MediaFolder,
  onProgress?: (percent: number) => void,
): Promise<UploadedMediaResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const sigRes = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const errBody = await sigRes.json().catch(() => ({}));
    throw new Error(errBody.error || "Unable to authorize image upload.");
  }

  const config = (await sigRes.json()) as UploadSignatureResponse;
  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", `contour-steel/${config.folder}`);

  if (config.signed && config.signature && config.timestamp && config.apiKey) {
    formData.append("api_key", config.apiKey);
    formData.append("timestamp", String(config.timestamp));
    formData.append("signature", config.signature);
  } else {
    formData.append("upload_preset", config.uploadPreset);
  }

  return new Promise<UploadedMediaResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            public_id: data.public_id,
            secure_url: data.secure_url,
            original_filename: data.original_filename || file.name,
            format: data.format || "",
            width: typeof data.width === "number" ? data.width : null,
            height: typeof data.height === "number" ? data.height : null,
            bytes: typeof data.bytes === "number" ? data.bytes : file.size,
            folder,
          });
        } catch {
          reject(new Error("Invalid response received from media server."));
        }
      } else {
        let message = "Image upload failed.";
        try {
          const errData = JSON.parse(xhr.responseText);
          message = errData?.error?.message || message;
        } catch {
          // ignore
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred during image upload."));
    };

    xhr.send(formData);
  });
}
