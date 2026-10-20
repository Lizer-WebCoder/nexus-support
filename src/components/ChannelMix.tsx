import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTickets } from '../context/TicketContext';
import ChartTooltip from './ChartTooltip';

const COLORS: Record<string, string> = {
  email: '#4f46e5',
  chat: '#8b5cf6',
  phone: '#06b6d4',
  portal: '#f59e0b',
  social: '#ec4899',
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
    color: COLORS[name] || '#a1a1aa',
  }));

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-card p-5">
      <h2 className="text-sm font-semibold text-zinc-800 mb-4">Channel mix</h2>
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
                paddingAngle={3}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueSuffix="%" />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-zinc-900 tabular-nums">{tickets.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600">{item.name}</span>
              </div>
              <span className="font-semibold text-zinc-900 tabular-nums">{item.value}%</span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-zinc-400">No tickets yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
