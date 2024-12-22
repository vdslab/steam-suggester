import { HomeHeader } from "@/components/common/Headers";
import Network from "@/components/network/Network";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

export default async function Page() {

  const data = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const steamAllData:SteamDetailsDataType[] = await data.json()

  return (
    <>
      <HomeHeader />
      <Network steamAllData={steamAllData} />
    </>
  );
}