import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { channelData } from '../data';

export default function ChannelMix() {
  const total = channelData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Channel Mix</h2>
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{total}</span>
            <span className="text-[10px] text-slate-500 uppercase">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {channelData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800 tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
