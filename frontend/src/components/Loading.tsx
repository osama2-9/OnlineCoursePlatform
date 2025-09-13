import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-6">
      <div className="relative mb-4 text-center">
        <Loader2 size={25} className="animate-spin" />
      </div>
      <p className=" text-black font-semibold text-center">
        Loading
      </p>
    </div>
  );
};
