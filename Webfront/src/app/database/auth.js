'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    redirect('/login?error=missing_fields');
  }

  let userId = null;
  let connectionError = false;

  try {
    // We send the credentials to the API. 
    // The API handles the encrypted password check and returns the user object if valid.
    const response = await fetch('http://192.168.10.5:4000/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    if (response.ok) {
      const userData = await response.json();
      // If the API confirms the user, it will provide the ID
      userId = userData.id;
    } else if (response.status === 401) {
      // Unauthorized - invalid credentials
      userId = null;
    } else {
      throw new Error('Server Error');
    }

  } catch (error) {
    console.error('Auth API Error:', error);
    connectionError = true;
  }

  // Handle redirects outside of the try-catch block to avoid NEXT_REDIRECT errors
  if (connectionError) {
    redirect('/login?error=api_failure');
  }

  if (!userId) {
    redirect('/login?error=invalid_credentials');
  }

  // Grant access by setting the session cookie with the ID returned by the API
  const cookieStore = await cookies();
  cookieStore.set('auth_session', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  redirect('/dashboard');
}