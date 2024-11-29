import React from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { SteamGenreType } from "@/types/api/getSteamDetailType";
import { NodeType } from "@/types/NetworkType";
 
interface PopupProps {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}
 
const Popup = (props: PopupProps) => {
  const { nodes, selectedIndex, setSelectedIndex } = props;
  const router = useRouter();

  if (selectedIndex === -1 || !nodes[selectedIndex]) {
    return null;
  }

  const node = nodes[selectedIndex];

  return (
    <div
      style={{
        top: "50%",
        left: "50%",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        padding: "16px",
        zIndex: 1000,
      }}
    >
      <h2 style={{ marginBottom: "8px" }}><strong>{node.index + 1}位</strong>{" "}{node.title}</h2>
      <Image
          src={node.imgURL}
          alt={node.title}
          width={1000}
          height={0}
          style={{
            borderRadius: "4px",
          }}
        />
      <div style={{ marginBottom: "8px" }}>
        <strong>Tags:</strong> {node.genres?.map((item: SteamGenreType) => item.description).join(", ") || "No tags"}
      </div>
      <div style={{ marginBottom: "8px" }}>
        
      </div>
      <div style={{ marginBottom: "16px" }}>
        <strong>{node.price || "無料"}{node.price !== 0 && "円"}</strong>
      </div>
      <button
        style={{
          backgroundColor: "#007BFF",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() =>
          router.push(
            `/desktop/details?steam_id=${node.steamGameId}&twitch_id=${node.twitchGameId}`
          )
        }
      >
        詳細を確認する
      </button>
      <button
        style={{
          backgroundColor: "transparent",
          color: "#333",
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          marginLeft: "8px",
        }}
        onClick={() => setSelectedIndex(-1)}
      >
        Close
      </button>
    </div>
  );
};

export default Popup;
