import { SteamDetailsDataType } from "./api/getSteamDetailType";
import { NodeType } from "./NetworkType";

export type SteamListProps = {
  steamAllData: SteamDetailsDataType[];
  nodes: NodeType[];
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};