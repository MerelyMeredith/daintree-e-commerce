import './cart.css';

export default function Cart() {
  return (
    <div className="cart-container">
      {/* Left Side: Items */}
      <div className="cart-items-section">
        <h1 style={{ marginBottom: '1.5rem' }}>Your Shopping Cart</h1>
        
        <div className="cart-item">
          <div className="item-info">
            <h3>Awesome Item</h3>
            <p className="item-meta">Quantity: 1</p>
          </div>
          <div className="item-price">$19.99</div>
        </div>

        <div className="cart-item">
          <div className="item-info">
            <h3>Cool Gadget</h3>
            <p className="item-meta">Quantity: 2</p>
          </div>
          <div className="item-price">$50.00</div>
        </div>
      </div>

      {/* Right Side: Summary */}
      <aside className="cart-summary">
        <h2 className="summary-title">Order Summary</h2>
        
        <div className="summary-row">
          <span>Subtotal</span>
          <span>$69.99</span>
        </div>
        
        <div className="summary-row">
          <span>Shipping</span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>FREE</span>
        </div>

        <div className="summary-row">
          <span>Taxes</span>
          <span>$0.00</span>
        </div>

        <div className="summary-row total-row">
          <span>Total</span>
          <span>$69.99</span>
        </div>

        <button className="checkout-btn">
          Proceed to Checkout
        </button>
        
        <p style={{ 
          fontSize: '0.8rem', 
          textAlign: 'center', 
          marginTop: '1rem', 
          color: 'var(--text-muted)' 
        }}>
          Secure Checkout Powered by your Brand
        </p>
      </aside>
    </div>
  );
}