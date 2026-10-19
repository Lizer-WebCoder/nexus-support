import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTickets } from '../context/TicketContext';

const COLORS: Record<string, string> = {
  email: '#0ea5e9',
  chat: '#38bdf8',
  phone: '#7dd3fc',
  portal: '#bae6fd',
  social: '#e0f2fe',
};

export default function ChannelMix() {
  const { tickets } = useTickets();

  const counts: Record<string, number> = {};
  tickets.forEach((t) => {
    counts[t.channel] = (counts[t.channel] || 0) + 1;
  });
  const total = tickets.length || 1;
  const data = Object.entries(counts).map(([name, value]) => ({
    name: name === 'chat' ? 'Live Chat' : name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value / total) * 100),
    color: COLORS[name] || '#94a3b8',
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Channel Mix</h2>
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
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
            <span className="text-xl font-bold text-slate-800">{tickets.length}</span>
            <span className="text-[10px] text-slate-500 uppercase">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
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
