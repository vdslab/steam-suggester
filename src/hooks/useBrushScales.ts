import { useMemo } from "react";
import { max, extent } from '@visx/vendor/d3-array';
import { scaleTime, scaleLinear } from '@visx/scale';

type Props = {
  data: any;
  filteredStock: any;
  xMax: number;
  yMax: number;
  xBrushMax: number;
  yBrushMax: number;
  getDate: (d: any) => Date;
  getStockValue: (d: any) => number;
};

const useBrushScales = ({
  data,
  filteredStock,
  xMax,
  yMax,
  xBrushMax,
  yBrushMax,
  getDate,
  getStockValue,
}: Props) => {
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date] || [new Date(), new Date()],
      }),
    [xMax, filteredStock],
  );

  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getStockValue) || 1],
        nice: true,
      }),
    [yMax, filteredStock],
  );

  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(data || [], getDate) as [Date, Date] || [new Date(), new Date()],
      }),
    [xBrushMax, data],
  );

  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data || [], getStockValue) || 1],
        nice: true,
      }),
    [yBrushMax, data],
  );

  const initialBrushPosition = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        start: { x: 0 },
        end: { x: 0 },
      };
    }
    const middleIndex = Math.floor(data.length / 4);
    const middleData = data[middleIndex];
    return {
      start: { x: brushDateScale(getDate(data[0])) || 0 },
      end: { x: brushDateScale(getDate(middleData)) || 0 },
    };
  }, [brushDateScale, data]);

  return {
    dateScale,
    stockScale,
    brushDateScale,
    brushStockScale,
    initialBrushPosition,
  };
};

export default useBrushScales;