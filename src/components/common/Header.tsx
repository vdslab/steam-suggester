import { TITLE } from "@/constants/titile";
import Link from "next/link";

const Header = () => {
  return (
    <div className="h-[8dvh] rounded-none bg-[#171a21] flex text-4xl p-4 text-white">
      <div>{TITLE}</div>
      <Link href="/network" className="p">
        Home
      </Link>
    </div>
  );
}

export default Header;
