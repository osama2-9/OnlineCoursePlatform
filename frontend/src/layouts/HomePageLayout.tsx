import { ReactNode } from "react";
import { HomePageFooter } from "../components/HomePageFooter";
import { HomePageNavbar } from "../components/HomePageNavbar";

interface HomePageLayoutInterface {
  children: ReactNode;
}

export const HomePageLayout = ({ children }: HomePageLayoutInterface) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HomePageNavbar />
      <div className="flex-grow mx-auto ">{children}</div>
      <HomePageFooter />
    </div>
  );
};
