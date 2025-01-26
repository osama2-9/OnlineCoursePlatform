import { ClipLoader } from "react-spinners";

export const Loading = () => {
  return (
    <div className="flex flex-row items-center mt-20 justify-center">
      <ClipLoader size={40} color="#FFA500" />
    </div>
  );
};
