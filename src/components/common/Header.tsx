import Link from "next/link";

const Header = () => {
  return (
    <div className="h-14 rounded-none border-2 border-black">
      <h1>ヘッダー</h1>
      <Link href="/network">
        Home
      </Link>
    </div>
  );
}

export default Header;
