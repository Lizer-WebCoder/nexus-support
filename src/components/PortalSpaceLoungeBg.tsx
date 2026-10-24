import '../portal-lounge.css';

/**
 * Full-page space lounge using the day/night reference photos.
 * Covers entire portal including behind the sidebar.
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
