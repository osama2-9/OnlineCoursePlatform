import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex flex-row items-center mt-20 justify-center">
      <Loader2 size={25} className="animate-spin" color="#FFA500" />
    </div>
  );
};
