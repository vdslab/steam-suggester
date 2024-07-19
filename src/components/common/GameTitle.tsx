const GameTitle = async (props: {steamGameId:string}) => {
  const { steamGameId } = props;

  const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`);
  const data = await response.json();


  return (
    <h2 className="text-5xl font-semibold mb-4 text-white text-center">{data.title}</h2>
  );
}

export default GameTitle;
