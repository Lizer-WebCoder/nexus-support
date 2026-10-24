import '../portal-lounge.css';

/**
 * Full-page space lounge — station window view of Earth / stars.
 * Covers entire portal including behind the sidebar.
 * Light + dark via html.nexus-light / html.nexus-dark.
 */
export default function PortalSpaceLoungeBg() {
  return (
    <div className="portal-lounge" aria-hidden>
      <div className="portal-lounge-walls" />
      <div className="portal-lounge-ceiling" />
      <div className="portal-lounge-floor" />

      <div className="portal-lounge-window">
        <div className="portal-lounge-space">
          <div className="portal-lounge-stars" />
          <div className="portal-lounge-nebula" />
          <div className="portal-lounge-planet-a" />
          <div className="portal-lounge-planet-b" />
          <div className="portal-lounge-earth" />
          <div className="portal-lounge-atmosphere" />
          <div className="portal-lounge-shooting" />
        </div>
        <div className="portal-lounge-window-frame" />
        <div className="portal-lounge-window-glow" />
      </div>

      <div className="portal-lounge-panel portal-lounge-panel-l">
        <span className="portal-lounge-hud" />
      </div>
      <div className="portal-lounge-panel portal-lounge-panel-r">
        <span className="portal-lounge-hud" />
      </div>

      <div className="portal-lounge-vignette" />
    </div>
  );
}
