import { useState } from "react";
import toast from "react-hot-toast";

export const VideoUploader = () => {
  const [video, setVideo] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("video/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setVideo(reader.result as string);
        setVideoFile(file);
        console.log("Video file loaded:", file.name);
      };

      reader.onerror = () => {
        toast.error("Failed to read the video file.");
        setVideo("");
        setVideoFile(null);
      };

      reader.readAsDataURL(file);
    } else {
      setVideo("");
      setVideoFile(null);
      toast.error("Please upload a valid video file.");
    }
  };

  return { video, videoFile, handleVideoChange };
};
