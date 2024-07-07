const Gametitle = async (props: {steamGameId:string}) => {
  const { steamGameId } = props;

  const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getMatchDetails/${steamGameId}/0`);
  const data = await response.json();


  return (
    <h2 className="text-xl font-semibold mb-4 text-white text-center">{data.title}</h2>
  );
}

export default Gametitle;