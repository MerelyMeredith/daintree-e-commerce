import './location.css';

export default function LocationPage() {
  return (
    <div className="location-page">
      <header className="location-header">
        <h1>Set Delivery Position</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Choose where you want your items to be sent for accurate availability.
        </p>
      </header>

      <div className="location-content">
        {/* Left Side: Controls */}
        <aside className="location-panel">
          <div className="search-box">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
              Search New Address
            </label>
            <input type="text" placeholder="Enter street, city, or zip..." />
          </div>

          <div className="saved-locations">
            <label style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Recently Used
            </label>
            
            <div className="location-item active">
              <span>🏠</span>
              <div>
                <div style={{ fontWeight: '700' }}>Home</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>123 Tech Avenue, Silicon Valley</div>
              </div>
            </div>

            <div className="location-item">
              <span>🏢</span>
              <div>
                <div style={{ fontWeight: '700' }}>Office</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>456 Innovation Blvd, New York</div>
              </div>
            </div>
          </div>

          <button className="save-loc-btn">Confirm This Position</button>
        </aside>

        {/* Right Side: Map */}
        <div className="map-viewport">
          {/* In a real app, you'd insert Google Maps or Leaflet here */}
          <div style={{ 
            position: 'absolute', 
            padding: '10px 20px', 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: 'var(--shadow-md)',
            fontWeight: 'bold',
            color: 'var(--primary)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            📍 Set Pin
          </div>
        </div>
      </div>
    </div>
  );
}