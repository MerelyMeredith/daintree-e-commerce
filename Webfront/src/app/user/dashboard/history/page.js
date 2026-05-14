import './history.css';

export default function History() {
  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Order History</h1>
        <span className="status-pill">2 Total Orders</span>
      </div>

      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Date">2024-01-10</td>
              <td data-label="Order ID" className="order-id">#9921</td>
              <td data-label="Status"><span className="status-pill">Delivered</span></td>
              <td data-label="Total" className="price-cell">$45.00</td>
            </tr>
            <tr>
              <td data-label="Date">2023-12-15</td>
              <td data-label="Order ID" className="order-id">#8810</td>
              <td data-label="Status"><span className="status-pill">Delivered</span></td>
              <td data-label="Total" className="price-cell">$120.50</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}