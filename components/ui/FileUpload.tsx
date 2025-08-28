// components/ui/FileUpload.tsx
"use client";
import { ChangeEvent } from "react";

export function FileUpload({
  multiple,
  accept,
  onUploaded,
}: {
  multiple?: boolean;
  accept?: string;
  onUploaded: (url: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo: use local preview URL. In real case, upload to server/Cloudinary and return URL
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      onUploaded(url);
    });
  };

  return (
    <>
      <label htmlFor="file-upload" className="cursor-pointer">
        Upload Files
      </label>
      <input
        id="file-upload"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </>
  );
}
