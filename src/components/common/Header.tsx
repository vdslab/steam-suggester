import { TITLE } from "@/constants/titile";
import Link from "next/link";

const Header = () => {
  return (
    <div className="h-[8dvh] leading-[8dvh] bg-[#171a21] flex text-3xl text-white space-x-5 pl-8">
      <div>{TITLE}</div>
      <Link href="/network">
        network
      </Link>
      <Link href="/details/apex">
        details
      </Link>
    </div>
  );
}

export default Header;
