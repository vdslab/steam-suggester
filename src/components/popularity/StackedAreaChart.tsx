
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { GradientOrangeRed } from '@visx/gradient';
import { scaleTime, scaleLinear } from '@visx/scale';
import { CountSteamReviews } from '@/types/Popularity/CountSteamReviews';
import CalcXDomain from './utils/CalcXDomain';
import { StackedAreasProps } from '@/types/Popularity/StackedAreaProps';
import { BG_COLOR_STACKED_AREA } from '@/constants/styles/stackedArea';

const getX = (d: CountSteamReviews) => d.date;
const getY0 = (d: SeriesPoint<CountSteamReviews>) => d[0] / 100;
const getY1 = (d: SeriesPoint<CountSteamReviews>) => d[1] / 100;

const StackedAreaChart =({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  events = false,
}: StackedAreasProps) => {
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const key1 = Object.keys(data[0]).filter((k) => k !== 'date');

  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: CalcXDomain(data),
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
  });

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <GradientOrangeRed id="stacked-area-orangered" />
      <rect x={0} y={0} width={width} height={height} fill={BG_COLOR_STACKED_AREA} rx={14} />
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={key1}
        data={data}
        x={(d) => xScale(getX(d.data)) ?? 0}
        y0={(d) => yScale(getY0(d)) ?? 0}
        y1={(d) => yScale(getY1(d)) ?? 0}
      >
        {({ stacks, path }) =>
          stacks.map((stack) => (
            <path
              key={`stack-${stack.key}`}
              d={path(stack) || ''}
              stroke="transparent"
              fill="url(#stacked-area-orangered)"
            //   onClick={() => {
            //     if (events) alert(`${stack.key}`);
            //   }}
            />
          ))
        }
      </AreaStack>
    </svg>
  );
}

export default StackedAreaChart

