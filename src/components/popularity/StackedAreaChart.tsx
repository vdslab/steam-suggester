
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleTime, scaleLinear, scaleOrdinal } from '@visx/scale';
import { CountSteamReviews } from '@/types/Popularity/CountSteamReviews';
import { StackedAreasProps } from '@/types/Popularity/StackedAreaProps';
import { BG_COLOR_STACKED_AREA } from '@/constants/styles/stackedArea';
import { AxisBottom, AxisLeft } from '@visx/axis';

const getX = (d: CountSteamReviews) => d.date * 1000;
const getY0 = (d: SeriesPoint<CountSteamReviews>) => d[0];
const getY1 = (d: SeriesPoint<CountSteamReviews>) => d[1];

const StackedAreaChart =({
  data,
  width,
  height,
  margin = { top: 10, right: 0, bottom: 0, left: 0 },
  events = false,
  colorRange,
}: StackedAreasProps) => {
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;


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


  return width < 10 ? null : (
    <svg width={width+ 100} height={height +50}>
      <rect x={70} y={margin.top} width={width} height={height -margin.top} fill={BG_COLOR_STACKED_AREA} />
      <AxisBottom scale={xScale} label='時間(年)' top={yMax+margin.top} left={70} hideZero numTicks={5} labelProps={{fill:'#e5e4e6'}} tickLabelProps={{fill: '#e5e4e6'}}/>
      <AxisLeft scale={yScale} label='数' left={70} top={margin.top} labelOffset={50} labelProps={{fill:'#e5e4e6'}} tickLabelProps={{fill: '#e5e4e6'}} tickLineProps={{fill: '#e5e4e6'}}/>
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={keys}
        data={data}
        x={(d) => xScale(getX(d.data)) + 70 ?? 0}
        y0={(d) => yScale(getY0(d)) + margin.top ?? 0}
        y1={(d) => yScale(getY1(d)) + margin.top ?? 0}
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

