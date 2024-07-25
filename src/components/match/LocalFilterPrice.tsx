type Props = {
  startPrice: number;
  endPrice: number;
  startPricePosition: number;
  endPricePosition: number;
};

const LocalFilterPrice = (props:Props) => {

  const { startPrice, endPrice, startPricePosition, endPricePosition } = props;


  const startLabelStyle = {
    left: `${startPricePosition}%`,
    whiteSpace: 'nowrap',
    transform: startPricePosition < 2 ? 'none' : 'translateX(-50%)'
  };

  const endLabelStyle = {
    left: `${endPricePosition}%`,
    whiteSpace: 'nowrap',
    transform: endPricePosition > 98 ? 'translateX(-100%)' : 'translateX(-50%)'
  };

  return (
    <>
      <div
        className="absolute top-0 transform -translate-x-1/2 h-full w-0.5 bg-green-800"
        style={{ left: `${startPricePosition}%` }}
      >
        <span
          className="absolute -top-5 mt-1 text-xs text-green-400"
          style={startLabelStyle}
        >
          {startPrice.toLocaleString()}
        </span>
      </div>
      <div
        className="absolute top-0 transform -translate-x-1/2 h-full w-0.5 bg-green-800"
        style={{ left: `${endPricePosition}%` }}
      >
        <span
          className="absolute -top-5 mt-1 text-xs text-green-400"
          style={endLabelStyle}
        >
          {endPrice.toLocaleString()}
        </span>
      </div>

      <div
        className="absolute top-0 h-full bg-green-800/20"
        style={{
          left: `${startPricePosition}%`,
          width: `${endPricePosition - startPricePosition}%`,
        }}
      ></div>
    </>
  );  
};

export default LocalFilterPrice;
