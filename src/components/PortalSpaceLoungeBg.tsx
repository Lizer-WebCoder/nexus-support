/**
 * Space lounge background — station window view of Earth / stars.
 * Matches the day/night lounge reference (light + dark).
 * Absolute behind content; does not affect layout flow.
 */
export default function PortalSpaceLoungeBg() {
  return (
    <div className="portal-lounge" aria-hidden>
      {/* Station interior frame */}
      <div className="portal-lounge-walls" />
      <div className="portal-lounge-floor" />

      {/* Main panoramic window */}
      <div className="portal-lounge-window">
        <div className="portal-lounge-space">
          <div className="portal-lounge-stars" />
          <div className="portal-lounge-nebula" />
          <div className="portal-lounge-planet-a" />
          <div className="portal-lounge-planet-b" />
          <div className="portal-lounge-earth" />
          <div className="portal-lounge-horizon" />
          <div className="portal-lounge-shooting" />
        </div>
        <div className="portal-lounge-window-frame" />
        <div className="portal-lounge-window-glow" />
      </div>

      {/* Side panels hint */}
      <div className="portal-lounge-panel portal-lounge-panel-l" />
      <div className="portal-lounge-panel portal-lounge-panel-r" />

      {/* Readability veil */}
      <div className="portal-lounge-veil" />
    </div>
  );
}
