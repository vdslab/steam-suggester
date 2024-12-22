import { NodeType } from "./NetworkType";

export type SteamListProps = {
  nodes: NodeType[];
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};