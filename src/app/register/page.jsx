"use client"
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName }); 

      router.push('/');
    } catch (error) {
      console.error('Error registering user:', error.message);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginLeft}>
        <h3 className={styles.loginLogo}>Todoist</h3>
        <span className={styles.loginDesc}>Todo-list for your everyday needs.</span>
      </div>
      <div className={styles.loginRight}>
        <form className={styles.loginBox} onSubmit={handleRegister}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Name"
          />
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
          <button type='submit'>Register</button>
        </form>
        {/* Add link to register page */}
      </div>
    </div>
  );
}
