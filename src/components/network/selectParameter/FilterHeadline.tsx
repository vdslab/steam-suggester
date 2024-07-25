type Props = {
  title: string;
}

const FilterHeadline = (props:Props) => {

  const { title } = props;

  return (
    <p className="bg-gray-900 text-white rounded px-4 py-2 mt-7 flex items-center justify-between w-full">
      {title}
    </p>
  )
}

export default FilterHeadline