"use client"
import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../../lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './login.module.css'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        router.push('/')
      }
    })
    return () => unsubscribe();
  }, [router])

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/');
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/');
    } catch (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginLeft}>
        <h3 className={styles.loginLogo}>
          Todoist
        </h3>
        <span className={styles.loginDesc}>Todo-list for your everyday needs.</span>
      </div>
      <div className={styles.loginRight}>
        <button onClick={handleGoogleLogin} className={styles.googleButton}>Login with Google</button>
        <form className={styles.loginBox} action={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type='submit'>Login</button>
        
        </form>
        {/* Add link to register page */}
      </div>
    </div>
  );
}
