import { Providers } from "@/components/common/AuthProvider";
import { SWRProvider } from "@/components/common/SWRProvider";
import Network from "@/components/Network";

export default async function Page() {
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900 safe-area">
      <Providers>
        <SWRProvider>
          <Network />
        </SWRProvider>
      </Providers>
    </div>
  );
}
