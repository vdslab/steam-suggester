import { useEffect, useState } from 'react';
import NodeLink from "./NodeLink";

const Network = (props: any) => {
  const [data, setData] = useState<any>([]);
  const [newData, setNewData] = useState<any>([]);

  useEffect(() => {

    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getCurrentTopGames`);
      const data = await res.json();

      setData(data);
      
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const newD: any = [];
      for(let i = 0; i < data.length; i += 1) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getMatchDetails/${data[i].steam_id}/${data[i].twitch_id}`);
        const d = await res.json();
        if(d !== null) {
          newD.push({...d, total_views: data[i].total_views});
        }
      }
      const slicedData = newD.slice(0,100);
      setNewData(slicedData);
    }
    fetchData();
  }, [data]);

  return (
    <>
      {newData.length !== 0 ? <NodeLink filter={props.filter} data={newData} /> : <div>Loading...</div>}
    </>
  );
};

export default Network;
