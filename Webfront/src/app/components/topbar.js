'use client';

import './topbar.css';
import { ShoppingCart, Bell, User, MapPin, Search } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topRow">
        <div className="logo">LOGO</div>
        
        <div className="location">
          <MapPin size={18} />
          <span>Select Location</span>
        </div>

        <div className="searchContainer">
          <select className="categorySelect">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Services</option>
          </select>
          <input type="text" placeholder="Search for anything..." />
          <button className="searchBtn"><Search size={18} /></button>
        </div>

        <div className="actions">
          <div className="cryptoInvite">
            <span>Play to Earn</span>
            <small>Crypto Games</small>
          </div>
          <Bell className="icon" />
          <ShoppingCart className="icon" />
          <div className="userProfile">
            <User />
            <div className="userInfo">
              <span>Join / Login</span>
              <small>Credit: $0.00</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}