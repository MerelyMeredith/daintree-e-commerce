import './footer.css';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="footer">
      <motion.div layout className="grid">
        <motion.div layout className="col">
          <h3>Company</h3>
          <ul>
            <li>Legal</li>
            <li>Provider</li>
            <li>Work with Us</li>
            <li>Support Articles</li>
          </ul>
        </motion.div>
        
        <motion.div layout className="col">
          <h3>Payment Methods</h3>
          <p>We accept all major credit cards, digital wallets, and various crypto assets to ensure a seamless checkout experience.</p>
        </motion.div>

        <motion.div layout className="col">
          <h3>Security First</h3>
          <p>Our system uses end-to-end encryption and multi-factor authentication to keep your data and assets safe 24/7.</p>
        </motion.div>

        <motion.div layout className="col">
          <h3>Our Partners</h3>
          <p>Explore the metaverse with <strong>Blink Galaxy</strong>. Join the ecosystem and unlock exclusive rewards.</p>
          <button className="partnerBtn">Join Blink Galaxy</button>
        </motion.div>
      </motion.div>
    </footer>
  );
}