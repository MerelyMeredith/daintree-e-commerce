"use client";
import { login } from '../database/auth';
import './user.css';

export default function LoginPage() {
  return (
    <div className='wrapper'>
      <div className='authCard'>
        <h1 className='title'>Welcome Back</h1>
        <p className='subtitle'>Enter your credentials to access your account</p>
        
        <form className='form' action={login}>
          <div className='inputGroup'>
            <label>Email Address</label>
            <input type="email" name="email" className='input' placeholder="name@company.com" required />
          </div>
          
          <div className='inputGroup'>
            <label>Password</label>
            <input type="password" name="password" className='input' placeholder="••••••••" required />
          </div>
          
          <button type="submit" name="submit" className='button'>Sign In</button>
        </form>
      </div>
    </div>
  );
}