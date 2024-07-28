import Link from "next/link"

const HomeHeader = () => {
  return (
    <div className="h-[8dvh] leading-[8dvh] bg-stone-950 border-b-2 border-gray-700 text-3xl text-white space-x-5 pl-8">
      <Link href="/" className="font-semibold">Steam Suggester</Link>
    </div>
  )
}

export default HomeHeader