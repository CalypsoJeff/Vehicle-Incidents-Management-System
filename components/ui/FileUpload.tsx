// // components/ui/FileUpload.tsx
// "use client";
// import { ChangeEvent } from "react";

// export function FileUpload({
//   multiple,
//   accept,
//   onUploaded,
// }: {
//   multiple?: boolean;
//   accept?: string;
//   onUploaded: (url: string) => void;
// }) {
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files) return;

//     // For demo: use local preview URL. In real case, upload to server/Cloudinary and return URL
//     Array.from(files).forEach((file) => {
//       const url = URL.createObjectURL(file);
//       onUploaded(url);
//     });
//   };

//   return (
//     <>
//       <label htmlFor="file-upload" className="cursor-pointer">
//         Upload Files
//       </label>
//       <input
//         id="file-upload"
//         type="file"
//         multiple={multiple}
//         accept={accept}
//         onChange={handleChange}
//         className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
//                  file:rounded-full file:border-0 file:text-sm file:font-semibold
//                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//       />
//     </>
//   );
// }

// components/ui/FileUpload.tsx
"use client";
import { ChangeEvent, useState } from "react";

type Props = {
  multiple?: boolean;
  accept?: string;
  onUploaded: (url: string) => void;
  folder?: string; // optional Cloudinary folder
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
console.log("ENV check", { CLOUD_NAME, UPLOAD_PRESET });


export function FileUpload({ multiple, accept, onUploaded, folder }: Props) {
  const [uploading, setUploading] = useState(false);

  async function uploadToCloudinary(file: File): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Missing Cloudinary env vars: NEXT_PUBLIC_CLOUDINARY_CLOUD and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
      );
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    if (folder) fd.append("folder", folder);

    // Use /auto so images, pdf, docs, etc. are accepted by the same endpoint
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const res = await fetch(endpoint, { method: "POST", body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Cloudinary upload failed (${res.status}): ${txt}`);
    }

    const json = await res.json();
    return json.secure_url as string; // <- what you should store/show
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      // Upload sequentially (simple & predictable). Change to Promise.all for parallel if you want.
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        onUploaded(url);
      }
    } catch (err) {
      console.error(err);
      alert("One or more files failed to upload. See console for details.");
    } finally {
      setUploading(false);
      // Optional: clear the input so the same file can be reselected
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor="file-upload" className="cursor-pointer inline-block">
        {uploading ? "Uploading…" : "Upload Files"}
      </label>
      <input
        id="file-upload"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />
    </div>
  );
}
