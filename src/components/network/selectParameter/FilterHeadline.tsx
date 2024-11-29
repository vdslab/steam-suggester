type Props = {
  title: string;
}

const FilterHeadline = (props:Props) => {

  const { title } = props;

  return (
    <p className="bg-slate-800 text-white px-4 mt-7 flex items-center justify-between w-full">
      {title}
    </p>
  )
}

export default FilterHeadline