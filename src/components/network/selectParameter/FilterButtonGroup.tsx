import { Filter } from "@/types/api/FilterType";

type Props = {
  title: string;
  mapping: any;
  localFilter: any;
  setLocalFilter: React.Dispatch<React.SetStateAction<Filter>>;
  rowLevel: number;
}

const FilterButtonGroup = (props:Props) => {

  const { title, mapping, localFilter, setLocalFilter, rowLevel } = props;

  const handleChangeFilter = (key: number) => {
    const newFilter = { ...localFilter };
    newFilter[title][key] = !newFilter[title][key];
    
    setLocalFilter(newFilter);
  };


  return (
    <div>
      <div
        className={`rounded mt-1 w-full z-10 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          transform: 'translateY(0)',
          border: 'none'
        }}
      >
        <div className="flex flex-wrap -mx-2 p-2">
          {Object.keys(mapping).map((key: any) => {
            const flag = localFilter[title][key];
            return (
              <div key={key} className={`p-2`} style={{ width: `${100 / rowLevel}%` }}>
                <button
                  onClick={() => handleChangeFilter(key)}
                  className={`
                    ${flag ? 'bg-blue-800 hover:bg-blue-900' : 'bg-gray-700 hover:bg-gray-600'}
                     text-white rounded px-2 py-2 w-full h-10 overflow-hidden text-sm drop-shadow-xl`}
                >
                  <span className="block truncate">{mapping[key]}</span>
                </button>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default FilterButtonGroup;