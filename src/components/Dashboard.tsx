import MetricBar from './MetricBar';
import TicketPulse from './TicketPulse';
import ChannelMix from './ChannelMix';
import Distribution from './Distribution';
import MyQueue from './MyQueue';
import TeamStatus from './TeamStatus';

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <MetricBar />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <TicketPulse />
          <MyQueue />
        </div>
        <div className="space-y-5">
          <ChannelMix />
          <Distribution />
          <TeamStatus />
        </div>
      </div>
    </div>
  );
}
