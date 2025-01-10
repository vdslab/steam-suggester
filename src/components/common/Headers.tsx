import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import { SteamIconButton } from "./Buttons";

export const DetailsHeader = () => {
  return (
    <div className="h-[8dvh] leading-[8dvh] bg-stone-950 border-b-2 border-gray-700 flex text-3xl text-white space-x-5 pl-8 justify-between select-none">
      <Link href="/" className="font-semibold">
        Steam Suggester
      </Link>
      <Link href="/" className="pr-10 pl-10 text-4xl hover:underline">
        <HomeIcon fontSize="large" sx={{ marginTop: "2.5vh" }} />
      </Link>
    </div>
  );
};

export const HomeHeader = ({
  isSidebarOpen,
  isSearchOpen,
}: {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
}) => {
  // クラスを条件に応じて動的に変更
  const paddingClass = (() => {
    // if (isSidebarOpen && isSearchOpen) return "pl-[20%]";
    if (isSidebarOpen) return "pl-[40%] xl:pl-[15%]";
    // if (isSearchOpen) return "pl-[5%]";
    return "";
  })();

  return (
    <header
      className={`absolute top-0 left-0 w-full h-[8vh] bg-gradient-to-b from-gray-800 to-transparent text-white flex items-center justify-center z-10 select-none transition-all duration-300 ${paddingClass} 
        xl:h-[6vh] xl:text-2xl 2xl:h-[6vh] 2xl:text-3xl`}
    >
      <h1 className="font-bold text-4xl sm:text-2xl lg:text-4xl">
        Steam Suggester
      </h1>
    </header>
  );
};

export const HomeHeaderMobile = () => {
  return (
    <div className="h-[7dvh] leading-[7dvh] bg-stone-950 border-b-2 border-gray-700 text-2xl text-white  space-x-5 pl-8 pr-8 flex justify-between">
      {/* <LeftSideMenu /> */}
      <Link href="/" className="font-semibold">
        Steam Suggester
      </Link>
      <SteamIconButton />
    </div>
  );
};

export const DetailsHeaderMobile = () => {
  return (
    <div className="h-[7dvh] leading-[7dvh] bg-stone-950 border-b-2 border-gray-700 text-2xl text-white space-x-5 pl-8 flex justify-between">
      <Link href="/" className="font-semibold">
        Steam Suggester
      </Link>
    </div>
  );
};
