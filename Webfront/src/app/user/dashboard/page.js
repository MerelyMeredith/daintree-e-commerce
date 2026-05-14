import Link from 'next/link';
import './dash.css'; // Make sure the path is correct

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Top Action Bar */}
      <div className="nav-actions">
        <Link href="/user/dashboard/cart">
          <button className="nav-btn">
            Shopping Cart
          </button>
        </Link>
        <Link href="/user/dashboard/history">
          <button className="nav-btn">
            Order History
          </button>
        </Link>
        <Link href="/user/dashboard/notifications">
          <button className="nav-btn">
            Notifications
          </button>
        </Link>
      </div>

      {/* Welcome Section */}
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <p>Welcome back! Here is a summary of your account activity.</p>
      </header>
      
      {/* Account Info Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Account Overview</h3>
          
          <div className="stat-item">
            <span className="stat-label">Available Credit</span>
            <span className="stat-value">$0.00</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Last Purchase</span>
            <span className="stat-value">Today</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Account Status</span>
            <span className="stat-value" style={{ color: '#10b981' }}>Verified</span>
          </div>
        </div>

        {/* Secondary Info Card for spacing/style */}
        <div className="stat-card">
          <h3>Quick Notifications</h3>
          <p className="stat-label">You have no new messages or alerts at this time.</p>
        </div>
      </div>
    </div>
  );
}