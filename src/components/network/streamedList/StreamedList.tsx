import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { NodeType, StreamerListType } from "@/types/NetworkType";
import { useCallback, useEffect, useState } from "react";
import similarity from 'string-similarity';
import CircularProgress from '@mui/material/CircularProgress';
import debounce from 'lodash.debounce';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Image from 'next/image';

type Props = {
  nodes: NodeType[];
  streamerIds: StreamerListType[];
  setStreamerIds: React.Dispatch<React.SetStateAction<StreamerListType[]>>;
};

const StreamedList = (props: Props) => {
  const { nodes, streamerIds, setStreamerIds } = props;
  console.log(streamerIds);
 
};

export default StreamedList;