import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

/**
 * Space lounge background for the main content area only
 * (right of the sidebar — the red-box region).
 * Exact day/night photos, HD, smooth theme crossfade.
 */
export default function PortalSpaceLoungeBg() {
  return (
    <div className="portal-lounge" aria-hidden>
      <div
        className="portal-lounge-photo portal-lounge-photo-day"
        style={{ backgroundImage: `url(${LOUNGE_DAY})` }}
      />
      <div
        className="portal-lounge-photo portal-lounge-photo-night"
        style={{ backgroundImage: `url(${LOUNGE_NIGHT})` }}
      />
      <div className="portal-lounge-veil" />
    </div>
  );
}
