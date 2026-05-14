'use client';

import './topbar.css';
import { ShoppingCart, Bell, User, MapPin, Search, Shell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topRow">
        <a href='/'>
          <Shell  className="icon" size={52} color="blue"/>
        </a>
        <a href='/location'>
          <div className="location">
            <MapPin className="icon" size={24} />
            <span>Select Location</span>
          </div>
        </a>

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
          <a href="https://blinkgalaxy.com/games">
            <button className="cryptoInvite" 
            >Play 2 Earn<br/>join blink galaxy</button>
          </a>
          <a href='/user/dashboard/notifications'>
            <Bell className="icon" size={24} />
          </a>
          <a href='/user/dashboard/cart'>
            <ShoppingCart className="icon" size={24} />
          </a>
          <div className="userProfile">
            <a href='/user'>
              <User className="icon" />
            </a>
            <div className="userInfo">
              <small>join</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}