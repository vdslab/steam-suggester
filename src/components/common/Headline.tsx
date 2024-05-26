type Props = {
  txt: string;
};

const Headline = (props: Props) => {

  const { txt } = props;

  return <h3 className="text-lg font-semibold mb-2">{txt}</h3>;
};

export default Headline;