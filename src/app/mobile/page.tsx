import { HomeHeaderMobile } from "@/components/common/Headers";
import NetworkMobile from "@/components/mobile/network/NetworkMobile";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { SteamListType } from "@/types/NetworkType";

export default async function Page() {

  const matchRes = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const steamAllData:SteamDetailsDataType[] = await matchRes.json()

  const steamListRes = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`);
  const steamListData:SteamListType[] = await steamListRes.json()

  return (
    <>
      <HomeHeaderMobile />
      <NetworkMobile steamAllData={steamAllData} steamListData={steamListData}/>
    </>
  );
}