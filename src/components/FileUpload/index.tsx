"use client";

import { Inbox } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "@/lib/s3";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles[0]);

      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        // file bigger than 10mb
        alert("Please upload a smaller file.");

        return;
      }

      try {
        const data = await uploadToS3(file);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <div className=" p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-col ",
        })}
      >
        <input {...getInputProps()} />
        <>
          <Inbox className=" w-10 h-10 text-black" />
          <p className=" mt-2 text-sm text-slate-400">Drop PDF Here</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
