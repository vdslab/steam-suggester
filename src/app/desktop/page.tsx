import Network from "@/components/network/Network";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { SteamListType } from "@/types/NetworkType";

export default async function Page() {
  const matchRes = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`
  );
  const steamAllData: SteamDetailsDataType[] = await matchRes.json();

  const steamListRes = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`
  );
  const steamListData: SteamListType[] = await steamListRes.json();

  return (
    <div className="flex flex-col h-screen">
      <Network steamAllData={steamAllData} steamListData={steamListData} />
    </div>
  );
}
