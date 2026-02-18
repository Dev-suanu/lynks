"use client";

import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { submitProofAction } from "@/app/actions/submission"
import { useState } from "react";
import { ImagePlus, CheckCircle2 } from "lucide-react";

export default function SubmissionForm({ postId }: { postId: string }) {
  const [isDone, setIsDone] = useState(false);

  if (isDone) return (
    <div className="flex flex-col mt-4 items-center justify-center p-8 bg-green-500/5 rounded-2xl border border-green-500/20">
      <CheckCircle2 className="text-green-500 mb-2" size={32} />
      <p className="text-green-500 font-bold">Proof Submitted Successfully!</p>
    </div>
  );

  return (
    <div className="mt-2">
      <div>
      <UploadDropzone<OurFileRouter, "screenshotUploader">
        endpoint="screenshotUploader"
        appearance={{
          container: {
            border: "2px dashed rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "2rem",
            backgroundColor: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          },
          label: {
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: "600",
          },
          allowedContent: {
            display: "none",
          },
          uploadIcon: {
            color: "#00B33C",
          },
          button: {
            background: "linear-gradient(to right, #07692d, #00B33C)",
            width: "100%",
            marginTop: "1rem",
            borderRadius: "0.75rem",
          }
        }}
        content={{
          label: "Drop screenshot or click to browse",
          uploadIcon: <ImagePlus size={40} strokeWidth={1.5} className="text-gray-400 mb-2" />,
        }}
        onClientUploadComplete={async (res) => {
          const url = res[0].url;
          const formData = new FormData();
          formData.append("postId", postId);
          formData.append("proofUrl", url);
          
          await submitProofAction(null, formData);
          setIsDone(true);
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
      </div>
    </div>
  );
}