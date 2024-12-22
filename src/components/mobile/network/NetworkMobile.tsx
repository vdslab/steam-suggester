"use client";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import createNetwork from "@/hooks/createNetwork";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import SelectParameter from "@/components/network/selectParameter/SelectParameter";
import GameList from "@/components/network/gameList/GameList";
import NodeLink from "@/components/network/NodeLink";
import Panel from "@/components/network/Panel";
import StreamedList from "@/components/network/streamedList/StreamedList";
import SearchBar from "./SearchBar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import ListIcon from '@mui/icons-material/List';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRouter } from "next/navigation";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { buttonClasses } from "@/components/network/Sidebar";


type Props = {
  steamAllData: SteamDetailsDataType[];
}

const NetworkMobile = (props: Props) => {

  const { steamAllData } = props;

  const router = useRouter();

  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isNetworkLoading, setIsNetworkLoading] = useState(true);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);

  // Refを使用して副作用の実行を制御
  const hasFetchedInitialData = useRef(false);
  
  const initialNodes = async (filter: Filter, gameIds: string[], slider: SliderSettings) => {
    setProgress(0);
    const result = await createNetwork(steamAllData, filter, gameIds, slider, setProgress);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    if (buffNodes.length > 0) {
      setCenterX((buffNodes[0]?.x ?? 0) - 150);
      setCenterY((buffNodes[0]?.y ?? 0) + 100);
      setSelectedIndex(-1);
    }
    setNodes(nodes);
    setLinks(links);
    setProgress(100);
    hasFetchedInitialData.current = false;
  };

  useEffect(() => {
    if (isNetworkLoading && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true; // フラグを立てる
      (async () => {
        const filterData = (await getFilterData()) ?? DEFAULT_FILTER;
        const gameIds = (await getGameIdData()) ?? [];
        const sliderData = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filterData);
        setSlider(sliderData);
        await initialNodes(filterData, gameIds, sliderData);
        setIsNetworkLoading(false);
      })();
    }
  }, [isNetworkLoading]);

  // 選択されたノードが変更されたときに中心座標を更新
  useEffect(() => {
    if (selectedIndex !== -1 && nodes[selectedIndex]) {
      setCenterX((nodes[selectedIndex].x ?? 0) -150);
      setCenterY((nodes[selectedIndex].y ?? 0) +100);
    }
  }, [selectedIndex]);

  const togglePanel = (panelName: string) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? null : panelName));
  };

  return (
    <div>
      {openPanel === "streamer"  && (
        <div className="w-2/3 bg-transparent overflow-y-auto overflow-x-hidden fixed">
          <Panel title="配信者" icon={<LiveTvIcon className="mr-2 text-white" />}>
            <StreamedList
              nodes={nodes}
              streamerIds={streamerIds}
              setStreamerIds={setStreamerIds}
            />
          </Panel>
        </div>
      )}

      {openPanel === "steamList" && (
        <div className="w-2/3 bg-transparent overflow-y-auto overflow-x-hidden fixed max-h-[93vh]">
          <GameList
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>
      )}

      <SearchBar
        nodes={nodes}
        isFilterOpen={openPanel === "filter"}
        setOpenPanel={setOpenPanel}
        setSelectedIndex={setSelectedIndex}
      />

      <div className="flex h-[88vh] overflow-hidden">

        {openPanel === "filter"  && (
          <div className="bg-gray-900 overflow-y-auto overflow-x-hidden z-50">
            <SelectParameter filter={filter} setFilter={setFilter} setIsNetworkLoading={setIsNetworkLoading} />
          </div>
        )}


        {selectedIndex !== -1 && (
          <div className="w-full h-2/6 fixed bottom-0 right-0 bg-transparent overflow-y-auto z-30">
            <Panel title={nodes[selectedIndex].title} icon={<MenuBookIcon className="mr-2 text-white" />}>
            <div className="text-gray-300 overflow-y-auto">
              {nodes[selectedIndex].shortDetails}
              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={() =>
                    router.push(
                      `/mobile/details?steam_id=${nodes[selectedIndex].steamGameId}&twitch_id=${nodes[selectedIndex].twitchGameId}`
                    )
                  }
                >
                  詳細を確認
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                  onClick={() => setSelectedIndex(-1)}
                >
                  閉じる
                </button>
              </div>
            </div>
            </Panel>
          </div>



        )}

        <div className="flex-1 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
          <NodeLink
            nodes={nodes}
            links={links}
            centerX={centerX}
            centerY={centerY}
            setSelectedIndex={setSelectedIndex}
            streamerIds={streamerIds}
            selectedIndex={selectedIndex}
            openPanel={openPanel}
          />
        </div>

        <div className="fixed top-40 right-2 z-10 bg-transparent text-white">
          <button
            onClick={() => togglePanel("streamer") }
            className={buttonClasses(openPanel === "streamer")}
          >
            <LiveTvIcon fontSize="large"/>
          </button>
          <button
            onClick={() => togglePanel("steamList")}
            className={buttonClasses(openPanel === "steamList")}
          >
            <ListIcon fontSize="large"/>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NetworkMobile;
