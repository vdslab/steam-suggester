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


const StreamedList = () => {
  
    return (
      <div>
        <h1>Streamed List</h1>
      </div>
    );
  };
  

export default StreamedList;