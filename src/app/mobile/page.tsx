import { HomeHeaderMobile } from "@/components/common/Headers";
import NetworkMobile from "@/components/mobile/network/NetworkMobile";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

export default async function Page() {

  const data = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const steamAllData:SteamDetailsDataType[] = await data.json()

  return (
    <>
      <HomeHeaderMobile />
      <NetworkMobile steamAllData={steamAllData}/>
    </>
  );
}