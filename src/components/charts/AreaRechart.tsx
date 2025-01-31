import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts'

type Props = {
  data: any[];
  dataKey: string;
  color: string;
  title: string;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const AreaRechart = (props:Props) => {

  const { data, dataKey, color, title } = props;

  return (
    <div className="flex-1 flex flex-col items-center justify-center border border-gray-500 rounded-md">
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data}>
          <XAxis dataKey={dataKey} hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              padding: "4px",
              backgroundColor: "#222",
              borderRadius: "4px",
            }}
            labelStyle={{ fontSize: "8px", color: "#aaa" }}
            itemStyle={{ fontSize: "8px", color: "#fff" }}
            labelFormatter={(value) => formatDate(value)}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            fill={color}
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-white text-center mt-2">{title}</div>
    </div>
  )
}

export default AreaRechart