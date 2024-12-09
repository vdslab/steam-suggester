'use client';

import { useState } from "react";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from "@mui/material";
import { NodeType } from "@/types/NetworkType";
import { useSearchParams } from 'next/navigation'

type Props = {
  nodes: any;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};

const SearchBar = (props:Props) => {

  const { nodes, isFilterOpen, setIsFilterOpen, setCenterX, setCenterY, setSelectedIndex } = props;

  const [searchNodesQuery, setSearchNodesQuery] = useState<string>('');

  const searchParams = useSearchParams()
 
  const updateIdParam = (id: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('id', id.toString())
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const handleGameClick = (index: number) => {

    updateIdParam(index);
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  const handleOptionClick = () => {
    if (searchNodesQuery == "") {
      setIsFilterOpen(!isFilterOpen);
    } else {
      setSearchNodesQuery('');
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFilterOpen(false);
    setSearchNodesQuery(e.target.value);
  }

  return (
    <div>
      <div className="flex h-[5vh] min-h-[45px] justify-evenly w-full bg-gray-900 border-b-2 border-gray-600 text-white">
        <div className="m-2 flex-1 border-2 bg-white">
          <input
            type="text"
            placeholder="検索"
            value={searchNodesQuery}
            onChange={handleSearchInput}
            className="w-[90%] h-full text-black p-2 rounded-l-md focus:outline-none"
          />
          <IconButton sx={{ padding:0}}>
            <SearchIcon />
          </IconButton>
        </div>
        <div className="pt-3">
          {searchNodesQuery == "" ? "絞り込み" : "取り消し"}
        </div>
        <IconButton onClick={handleOptionClick}>
          {searchNodesQuery == "" ?
            isFilterOpen ? <ExpandLessIcon className="text-white"/> :<ExpandMoreIcon className="text-white"/>
            : <CloseIcon className="text-white"/>
          }
        </IconButton>
      </div>
      {searchNodesQuery !== '' && (
        <div className="bg-gray-700 p-2 rounded-b-md max-h-60 overflow-y-auto z-50 fixed w-screen">
          <h2 className="text-white mb-2">検索結果</h2>
          {nodes.filter((node:NodeType) => node.title.includes(searchNodesQuery)).map((node:NodeType) => (
            <div className='flex pb-2 justify-between items-center border-b-2 border-gray-500' key={node.index} onClick={() => handleGameClick(node.index)}>
              <div className="text-white p-2 rounded">
                {node.title}
              </div>
              <KeyboardArrowRightIcon className="text-white" />
              </div>
          ))}
        </div>
        )}
    </div>
  )
}

export default SearchBar;
