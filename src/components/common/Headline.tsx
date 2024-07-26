type Props = {
  txt: string;
};

const Headline = (props: Props) => {

  const { txt } = props;

  return <div className="p-2 text-lg mb-1 text-white font-semibold select-none">{txt}</div>;
};

export default Headline;