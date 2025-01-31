import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts'

type Props = {
  data: any[];
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

// ヘルパー関数: データが存在し、最新のカウントが0でないかをチェック
const hasValidData = (data: any[], key: string) => {
  return data.length > 0 && (data[data.length - 1][key] || 0) > 0;
};


const AreaRechart = (props:Props) => {

  const { data, color, title } = props;


  return (
    <div className="flex-1 flex-col items-center justify-center alien-center border border-gray-500 rounded-md ">
      {hasValidData(data, "count") ? (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={data}>
            <XAxis dataKey="date" hide />
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
      ) : (
        <div className="flex-1 flex items-center justify-center text-white">
          データがありません
        </div>
      )}
      <div className="text-white text-center">{title}</div>
    </div>
  )
}

export default AreaRechart