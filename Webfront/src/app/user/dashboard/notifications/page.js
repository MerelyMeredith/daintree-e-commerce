import './notifications.css';

export default function Notifications() {
  return (
    <div className="notif-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Notifications & Offers</h1>
        <p style={{ color: 'var(--text-muted)' }}>Stay updated with your account activity and exclusive deals.</p>
      </header>

      <div className="notif-list">
        
        {/* Special Offer Card */}
        <div className="notif-card type-offer">
          <div className="notif-indicator"></div>
          <div className="notif-content">
            <div className="notif-header">
              <span className="notif-title">🔥 Limited Time Offer!</span>
              <span className="notif-time">Expires in 2h</span>
            </div>
            <p className="notif-body" style={{ color: 'white' }}>
              Get 20% off your next purchase with the code <strong>SAVE20</strong>. 
              Click below to apply it to your cart automatically.
            </p>
            <button className="claim-btn">Claim Offer</button>
          </div>
        </div>

        {/* Info Card */}
        <div className="notif-card type-info">
          <div className="notif-indicator"></div>
          <div className="notif-content">
            <div className="notif-header">
              <span className="notif-title">System Update</span>
              <span className="notif-time">10:45 AM</span>
            </div>
            <p className="notif-body">
              Your security settings were successfully updated. No further action is required.
            </p>
          </div>
        </div>

        {/* Regular Notification */}
        <div className="notif-card type-info">
          <div className="notif-indicator"></div>
          <div className="notif-content">
            <div className="notif-header">
              <span className="notif-title">Order #9921 Delivered</span>
              <span className="notif-time">Yesterday</span>
            </div>
            <p className="notif-body">
              Your package was dropped off at the front door. We hope you enjoy your purchase!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}