import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

/**
 * Full-page space lounge using the day/night reference photos.
 * Covers entire portal including behind the sidebar.
 * No side HUD cards.
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
