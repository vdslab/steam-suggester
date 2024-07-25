import Link from "next/link";

const Header = () => {
  return (
    <div className="h-[8dvh] leading-[8dvh] bg-[#171a21] flex text-3xl text-white space-x-5 pl-8 justify-between">
      <div>Steam Suggester</div>
      <Link href="/" className="pr-10 pl-10 hover:bg-[#22262e]">
        network
      </Link>
    </div>
  );
}

export default Header;
