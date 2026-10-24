import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

/**
 * Full-page space lounge using the exact day/night reference photos
 * (image-39 light, image-38 dark). Covers entire portal including
 * behind the sidebar. No generated art, no extra side cards.
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
