import { Providers } from "@/components/common/AuthProvider";
import Network from "@/components/Network";

export default async function Page() {
  return (
    <div className="flex flex-col h-screen">
      <Providers>
        <Network />
      </Providers>
    </div>
  );
}
