import Network from "@/components/network/Network";
import { gameDetailType } from "@/types/api/gameDetailsType";

export default async function Page() {

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const data:gameDetailType[] = await res.json();

  return (
    <div>
      <Network data={data} />
    </div>
  );
}