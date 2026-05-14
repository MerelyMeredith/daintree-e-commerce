'use client';

import './globals.css';

export default function Home() {
  const placeholders = Array(8).fill(null);

  return (
    <div className="container">
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
    </div>
  );
}