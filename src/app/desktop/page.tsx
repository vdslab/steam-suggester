import HomeHeader from "@/components/common/HomeHeader";
import Network from "@/components/network/Network";
import { getServerSession } from "next-auth";

export default async function Page() {

  const session = await getServerSession();

  return (
    <>
      <HomeHeader />
      <Network />
    </>
  );
}