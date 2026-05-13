'use client';

import Topbar from './components/topbar';
import Footer from './components/footer';
import './globals.css';

export default function Home() {
  const placeholders = Array(8).fill(null);

  return (
    <div className="container">
      <Topbar />
      
      <main className="main">
        <section className="hero">
          <h1>Welcome to the Platform</h1>
        </section>

        <div className="grid">
          {placeholders.map((_, i) => (
            <div key={i} className="card"></div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}