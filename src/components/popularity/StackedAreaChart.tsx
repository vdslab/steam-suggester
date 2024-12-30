/*StackedAreaChart.tsx*/
'use client'
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleTime, scaleLinear, scaleOrdinal } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { BG_COLOR_STACKED_AREA } from '@/constants/STYLES';
import { curveBasis } from 'd3-shape';
import { formatDate, getFirstOfMonthTicks } from './FormatLabel';
import { CountSteamReviews, StackedAreasProps } from '@/types/DetailsType';

const getX = (d: CountSteamReviews) => d.date * 1000;
const getY0 = (d: SeriesPoint<CountSteamReviews>) => d[0];
const getY1 = (d: SeriesPoint<CountSteamReviews>) => d[1];

const StackedAreaChart =({
  data,
  width,
  height,
  labelTxt,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  colorRange,
}: StackedAreasProps) => {
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  // データがない場合は何も表示しない
  if (!data || data.length === 0) {
    return <div className={`w-[${width + margin.left + margin.right}] h-[${height + margin.top + margin.bottom}]`}></div>;
  }

  const keys = Object.keys(data[0]).filter((k) => k !== 'date');


  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: colorRange,
  });

  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: [Math.min(...data.map((d) => d.date * 1000)), Math.max(...data.map((d) => d.date * 1000))]
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map((d) => d.count))],
  }).nice();

  const dates = data.map(d => new Date(d.date * 1000));
  const firstOfMonthTicks = getFirstOfMonthTicks(dates);


  return(
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width + 100} ${height + 50}`}
    >
      <rect x={70} y={margin.top} width={width} height={height -margin.top} fill={BG_COLOR_STACKED_AREA} />
      <AxisBottom
        scale={xScale}
        label={labelTxt.bottom}
        top={yMax+margin.top}
        left={70}
        hideZero
        numTicks={5}
        labelProps={{fill:'#e5e4e6'}}
        tickLabelProps={{fill: '#e5e4e6'}}
        tickFormat={(_value, index) => {
          const { date, isFirstOfMonth } = firstOfMonthTicks[index];
          return formatDate(date, isFirstOfMonth)
        }}
      />
      <AxisLeft
        scale={yScale}
        label={labelTxt.left}
        left={70}
        top={margin.top}
        labelOffset={50}
        labelProps={{fill:'#e5e4e6'}}
        tickLabelProps={{fill: '#e5e4e6'}}
        tickLineProps={{fill: '#e5e4e6'}}
        numTicks={7}
      />
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={keys}
        data={data}
        x={(d) => xScale(getX(d.data)) + 70}
        y0={(d) => yScale(getY0(d)) + margin.top}
        y1={(d) => yScale(getY1(d)) + margin.top}
        curve={ curveBasis }
      >
        {({ stacks, path }) =>
          stacks.map((stack) => {
            const color = colorScale(stack.key);
            return (
            <path
              key={`stack-${stack.key}`}
              d={path(stack) || ''}
              stroke="transparent"
              fill={color}
            />);
          })
        }
      </AreaStack>
    </svg>
  );
}

export default StackedAreaChart
