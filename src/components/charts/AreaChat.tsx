import React from 'react';
import { Group } from '@visx/group';
import { AreaClosed } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';

// Initialize some variables
const axisColor = '#fff';
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily: 'Arial',
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: axisColor,
};

export default function AreaChart({
  data,
  gradientColor,
  width,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
  getDate,
  getStockValue,
}: {
  data: any[];
  gradientColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: React.ReactNode;
  getDate: (d:any) => Date;
  getStockValue: (d:any) => number;
}) {
  if (width < 10) return null;
  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id={gradientColor}
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed
        data={data}
        x={(d) => xScale(getDate(d)) || 0}
        y={(d) => yScale(getStockValue(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke={`url(#${gradientColor})`}
        fill={`url(#${gradientColor})`}
        curve={curveMonotoneX}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisLeftTickLabelProps}
        />
      )}
      {children}
    </Group>
  );
}