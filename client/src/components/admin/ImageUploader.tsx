// import React, { useRef, useState } from "react";

// interface CloudinaryOption {
//   name: string;
//   cloudName: string;
//   uploadPreset: string;
// }

// interface ImageUploaderProps {
//   onUpload: (urls: string[]) => void;
//   cloudinaryOptions: CloudinaryOption[];
// }

// const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, cloudinaryOptions }) => {
//   const [selectedCloud, setSelectedCloud] = useState(cloudinaryOptions[0]);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState("");
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     setUploading(true);
//     setError("");
//     const urls: string[] = [];
//     for (const file of Array.from(e.target.files)) {
//       try {
//         const url = `https://api.cloudinary.com/v1_1/${selectedCloud.cloudName}/image/upload`;
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", selectedCloud.uploadPreset);
//         const res = await fetch(url, { method: "POST", body: formData });
//         const data = await res.json();
//         if (data.secure_url) {
//           urls.push(data.secure_url);
//         } else {
//           setError("Upload failed for one or more images.");
//         }
//       } catch (err) {
//         setError("Upload failed for one or more images.");
//       }
//     }
//     setUploading(false);
//     if (urls.length) onUpload(urls);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div>
//       <label className="block mb-2 font-medium">Select Cloudinary</label>
//       <select
//         className="mb-4 border rounded px-2 py-1"
//         value={selectedCloud.name}
//         onChange={e => {
//           const found = cloudinaryOptions.find(opt => opt.name === e.target.value);
//           if (found) setSelectedCloud(found);
//         }}
//       >
//         {cloudinaryOptions.map(opt => (
//           <option key={opt.name} value={opt.name}>{opt.name}</option>
//         ))}
//       </select>
//       <input
//         type="file"
//         multiple
//         accept="image/*"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         className="block mb-2"
//         disabled={uploading}
//       />
//       {uploading && <div>Uploading...</div>}
//       {error && <div className="text-red-600">{error}</div>}
//     </div>
//   );
// };

// export default ImageUploader;

import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { TokenManager } from '@/utils/tokenManager';

const API_URL: string = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface CloudinaryOption {
  name: string;
  endpoint: string; // Changed from cloudName and uploadPreset
}

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  cloudinaryOptions: CloudinaryOption[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, cloudinaryOptions }) => {
  const [selectedCloud, setSelectedCloud] = useState(cloudinaryOptions[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    setError("");
    
    const urls: string[] = [];

     const adminToken = TokenManager.getToken('admin'); // Adjust key name as needed
      
      if (!adminToken) {
  setError('Admin token not found. Please login again.');
  setUploading(false);
  return;
}
    
    for (const file of Array.from(e.target.files)) {
      try {
        // Step 1: Get signature from your server
        const signatureResponse = await fetch(`${API_URL}/admin/getsignature`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            Product_name: `upload_${Date.now()}`,
            Product_category: 'general',
            cloudInstance: selectedCloud.name === "Secondary Cloud" ? 'secondary' : 'primary'
          }),
        });

        if (!signatureResponse.ok) {
        if (signatureResponse.status === 401) {
          // Token might be expired
          localStorage.removeItem('admin_token');
          setError('Session expired. Please login again.');
          setUploading(false);
          return;
        }
        throw new Error('Failed to get signature');
      }

        const signatureData = await signatureResponse.json();
        const { signature, timestamp, public_id, cloud_name, CLOUDINARY_API_KEY, uploadUrl } = signatureData.signature;

        // Step 2: Upload to Cloudinary using the signature
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());
        formData.append("public_id", public_id);
        formData.append("api_key", CLOUDINARY_API_KEY);

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.secure_url) {
          urls.push(uploadData.secure_url);
        } else {
          setError("Upload failed for one or more images.");
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError("Upload failed for one or more images.");
      }
    }
    
    setUploading(false);
    if (urls.length) onUpload(urls);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
   <div className="space-y-3">
      {/* Simple Cloud Selection */}
      <div className="flex items-center gap-3">
        <select
          className="px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedCloud.name}
          onChange={e => {
            const found = cloudinaryOptions.find(opt => opt.name === e.target.value);
            if (found) setSelectedCloud(found);
          }}
        >
          {cloudinaryOptions.map(opt => (
            <option key={opt.name} value={opt.name}>{opt.name}</option>
          ))}
        </select>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Active
        </div>
      </div>

      {/* File Upload Area */}
      <div>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="category-image-upload"
        />
        <label
          htmlFor="category-image-upload"
          className={`
            flex items-center justify-center w-full h-32 px-6 py-4
            border-2 border-dashed border-input rounded-md cursor-pointer
            transition-colors hover:bg-accent/50
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <div className="mx-auto h-8 w-8 text-muted-foreground mb-2">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm text-muted-foreground">
              {uploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <span className="font-medium">Click to upload</span>
                  <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
