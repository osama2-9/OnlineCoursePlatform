import { useState } from "react";
import toast from "react-hot-toast";

export const ImgReader = () => {
  const [img, setImg] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file?.name);

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImg(reader.result as string);
        console.log(reader.result);
        console.log(reader.readAsDataURL);
      };

      reader.readAsDataURL(file);
    } else {
      setImg("");
      toast.error("Cannot upload this type");
    }
    console.log(file);
    
  };

  return { img, handleImageChange };
};
