// components/ui/FileUpload.tsx
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "./Button";

type Props = {
  multiple?: boolean;
  accept?: string;
  onUploaded: (url: string) => void;
  folder?: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

// PROD-ONLY uploader (no mock)
async function upload(file: File, folder?: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Uploads not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD and NEXT_PUBLIC_CLOUDINARY_PRESET."
    );
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  if (folder) fd.append("folder", folder);

  // 'auto' accepts images, pdf, docs, etc. Use 'image/upload' if you only want images.
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${res.status}): ${txt}`);
  }
  const json = await res.json();
  return json.secure_url as string;
}

export function FileUpload({ multiple, accept, onUploaded, folder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    e.target.value = ""; // clear immediately

    setUploading(true);
    setRemaining(files.length);
    try {
      for (const f of files) {
        const url = await upload(f, folder);
        onUploaded(url);
        setRemaining((n) => Math.max(0, n - 1));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
      setRemaining(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        aria-label="Select files to upload"
        className="hidden"
      />

      <Button type="button" onClick={openPicker} disabled={uploading}>
        {uploading
          ? `Uploading… ${remaining ? `(${remaining})` : ""}`
          : "Upload Files"}
      </Button>

      <p className="text-xs text-gray-500">
        {accept ? `Accepts: ${accept}` : "All file types accepted"}
        {multiple ? " (multiple files allowed)" : ""}
      </p>
    </div>
  );
}
