'use client';

import { useEffect, useState } from "react";

const Gametitle = (props: {steamGameId:string}) => {
  const { steamGameId } = props;
  const [title, setTitle] = useState<string>("");
  
  useEffect(() => {
    (async() => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getMatchDetails/${steamGameId}/0`);
      const data = await response.json();
      setTitle(data.title);
    })();
    
  },[]);

  return (
    <h2 className="text-xl font-semibold mb-4 text-white text-center">{title}</h2>
  );
}

export default Gametitle;