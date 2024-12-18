
import { useState, useEffect, useRef } from "react";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import { NodeType, LinkType } from "@/types/NetworkType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import createNetwork from "./createNetwork";
import { getFilterData, getSliderData } from "./indexedDB";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";

const useNetworkGraph = (
  allData: SteamDetailsDataType[] | null,
  isLoading: boolean,
  isNetworkLoading: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const hasFetchedInitialData = useRef(false);

  const initialNodes = async () => {
    if (!allData) return;
    setProgress(0);
    const { nodes, links } = await createNetwork(allData, filter, slider, setProgress);
    const sortedNodes = [...nodes].sort(
      (a, b) => (b.circleScale ?? 0) - (a.circleScale ?? 0)
    );
    if (centerX === 0 && centerY === 0 && sortedNodes.length > 0) {
      setCenterX((sortedNodes[0].x ?? 0) - 150);
      setCenterY((sortedNodes[0].y ?? 0) + 100);
    }
    setNodes(nodes);
    setLinks(links);
    setProgress(100);
    hasFetchedInitialData.current = false;
  };

  useEffect(() => {
    if (!allData) return;

    if ((isLoading || isNetworkLoading) && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      (async () => {
        const filterData = (await getFilterData()) ?? DEFAULT_FILTER;
        const sliderData = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filterData);
        setSlider(sliderData);
        await initialNodes();
        setIsLoading(false);
        setIsNetworkLoading(false);
      })();
    }
  }, [isLoading, isNetworkLoading, allData]);

  return {
    nodes,
    links,
    centerX,
    centerY,
    filter,
    setFilter,
    slider,
    setSlider,
    setCenterX,
    setCenterY,
  };
};

export default useNetworkGraph;