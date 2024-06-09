
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleTime, scaleLinear, scaleOrdinal } from '@visx/scale';
import { CountSteamReviews } from '@/types/Popularity/CountSteamReviews';
import { StackedAreasProps } from '@/types/Popularity/StackedAreaProps';
import { BG_COLOR_STACKED_AREA } from '@/constants/styles/stackedArea';
import { AxisBottom, AxisLeft } from '@visx/axis';

const getX = (d: CountSteamReviews) => d.date;
const getY0 = (d: SeriesPoint<CountSteamReviews>) => d[0];
const getY1 = (d: SeriesPoint<CountSteamReviews>) => d[1];

const StackedAreaChart =({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  events = false,
}: StackedAreasProps) => {
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;


  const keys = Object.keys(data[0]).filter((k) => k !== 'date');

  // console.log(data);

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: ['#ffc409', '#f14702', '#262d97', 'white', '#036ecd', '#9ecadd', '#51666e'],
  });

  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: [Math.min(...data.map((d) => d.date)), Math.max(...data.map((d) => d.date))]
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map((d) => d.count))],
  });

  console.log(xScale.domain());

  return width < 10 ? null : (
    <svg width={width+ 100} height={height +50}>
      {/* <GradientOrangeRed id="stacked-area-orangered" /> */}
      <rect x={70} y={0} width={width} height={height} fill={BG_COLOR_STACKED_AREA} rx={14} />
      <AxisBottom scale={xScale} label='時間(h)' top={yMax} left={70} />
      <AxisLeft scale={yScale} label='レビュー数' left={70} top={0}/>
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={keys}
        data={data}
        x={(d) => xScale(getX(d.data)) + 70 ?? 0}
        y0={(d) => yScale(getY0(d)) ?? 0}
        y1={(d) => yScale(getY1(d)) ?? 0}
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

