'use client';

import './topbar.css';
import { ShoppingCart, Bell, User, MapPin, Search, Shell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topRow">
        <Shell  className="icon" size={52} color="blue"/>
        
        <div className="location">
          <MapPin className="icon" size={24} />
          <span>Select Location</span>
        </div>

        <div className="searchContainer">
          <select className="categorySelect">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Services</option>
          </select>
          <input type="text" placeholder="Search for anything..." />
          <button className="searchBtn"><Search size={20} height={-1}/></button>
        </div>

        <div className="actions">
          <div className="cryptoInvite">
            <span>Play to Earn</span>
            <br/>
            <small>Crypto Games</small>
          </div>
          <Bell className="icon" size={24} />
          <ShoppingCart className="icon" size={24} />
          <div className="userProfile">
            <User className="icon" />
            <div className="userInfo">
              <small>join</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}