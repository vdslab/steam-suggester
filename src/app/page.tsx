import { Providers } from "@/components/common/AuthProvider";
import Network from "@/components/network/Network";
import { SteamListType } from "@/types/NetworkType";

export default async function Page() {
  const steamListRes = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`
  );
  const steamListData: SteamListType[] = await steamListRes.json();

  return (
    <div className="flex flex-col h-screen">
      <Providers><Network steamListData={steamListData} /></Providers>
    </div>
  );
}
