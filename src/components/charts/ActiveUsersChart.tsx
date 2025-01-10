'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import AreaChart from './AreaChat';
import { GetActiveUserResponse } from '@/types/api/getActiveUserType';
import CircularProgress from '@mui/material/CircularProgress';
import { fetcher } from '../common/Fetcher';
import useSWR from 'swr';
import useBrushScales from '@/hooks/useBrushScales';

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const accentColor = '#f6acc8'; //ブラシのパターンの色
export const background = '#584153'; //グラフの背景色
export const background2 = '#af8baf'; //グラフの塗りつぶし色
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white',
};
const MIN_DATA_LENGTH = 7;

// accessors
const getDate = (d: GetActiveUserResponse) => new Date(d.get_date);
const getStockValue = (d: GetActiveUserResponse) => d.active_user;

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  steamGameId: string;
};

function ActiveUsersChart({
  width,
  height,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
  steamGameId,
}: BrushProps) {

  const { data, error } = useSWR<GetActiveUserResponse[]>(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getActiveUser/${steamGameId}`, fetcher);

  const [filteredStock, setFilteredStock] = useState<GetActiveUserResponse[]>([]);
  const brushRef = useRef<BaseBrush | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // モバイル判定をパスで行うようにするかも
  // const basePath = currentPath.startsWith('/desktop') ? '/desktop' : '/mobile';

  useEffect(() => {
    if (data) {
      setFilteredStock(data);
    }
    if (typeof window !== 'undefined') {
      // モバイル端末を判定
      setIsMobile(/Mobi|Android/i.test(window.navigator.userAgent));
    }
  }, [data]);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain || !data) return;

      // モバイルデバイスではスクロールを防ぐ
    window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  
    const { x0, x1, y0, y1 } = domain;
    const stockCopy = data?.filter((s) => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    }) || [];
    setFilteredStock(stockCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  // scales
  const { dateScale, stockScale, brushDateScale, brushStockScale, initialBrushPosition } = useBrushScales({ data, filteredStock, xMax, yMax, xBrushMax, yBrushMax, getDate, getStockValue });

  const handleClearClick = () => {
    if (brushRef?.current) {
      setFilteredStock(data || []);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = (prevBrush) => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end,
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  if (data.length < MIN_DATA_LENGTH) {
    return <div>データがありません。</div>;
  }
  

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} />
        <rect x={0} y={0} width={width} height={height} fill={`url(#${GRADIENT_ID})`} rx={14} />
        <AreaChart
          data={filteredStock}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={dateScale}
          yScale={stockScale}
          gradientColor={background2}
          getDate={getDate}
          getStockValue={getStockValue}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={data}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
          getDate={getDate}
          getStockValue={getStockValue}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredStock(data)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents={!isMobile}
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </AreaChart>
      </svg>
      <button onClick={handleClearClick}>Clear</button>&nbsp;
      <button onClick={handleResetClick}>Reset</button>
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
}

export default ActiveUsersChart;