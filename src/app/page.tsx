import Network from "@/components/network/Network";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { SteamListType } from "@/types/NetworkType";

export default async function Page() {
  try {
    // データ取得
    const steamListRes = await fetch(
      `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`
    );
    const steamListData: SteamListType[] = await steamListRes.json();

    return (
      <div className="flex flex-col h-screen">
        <Network steamListData={steamListData} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="flex flex-col h-screen">
        <p>データの取得に失敗しました。</p>
      </div>
    );
  }
}
