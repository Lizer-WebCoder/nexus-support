import '../portal-lounge.css';

/**
 * Full-page space lounge using the exact day/night reference photos
 * (image-39 light, image-38 dark). Covers entire portal including
 * behind the sidebar. No generated art, no extra side cards.
 */
export default function PortalSpaceLoungeBg() {
  return (
    <div className="portal-lounge" aria-hidden>
      <div className="portal-lounge-photo portal-lounge-photo-day" />
      <div className="portal-lounge-photo portal-lounge-photo-night" />
      <div className="portal-lounge-veil" />
    </div>
  );
}
