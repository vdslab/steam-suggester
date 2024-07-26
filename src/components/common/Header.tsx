import Link from "next/link";
import HomeIcon from '@mui/icons-material/Home';

const Header = () => {
  return (
    <div className="h-[8dvh] leading-[8dvh] bg-stone-950 border-b-2 border-gray-700 flex text-3xl text-white space-x-5 pl-8 justify-between">
      <Link href="/" className="font-semibold">Steam Suggester</Link>
      <Link href="/" className="pr-10 pl-10 text-4xl hover:underline">
        <HomeIcon fontSize="large" sx={{ marginTop: 2}} />
        {/* Home */}
      </Link>
    </div>
  );
}

export default Header;