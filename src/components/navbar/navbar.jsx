"use client"
import { useEffect, useState } from 'react';
import styles from './navbar.module.css'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';


export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        <p>Todoist</p>
      </div>
      {
        user ? (
          <div className={styles.right}>
            <Image width={35} height={35} alt="" src={user.photoURL ? user?.photoURL : '/dummy.jpeg'}/>
            <p>Welcome {user?.displayName|| user?.email?.split('@')[0] } !</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className={styles.right}>
            <Link href='/login'><button>Login</button></Link>
            <Link href='/register'><button>Register</button></Link>
          </div>
        )
      }
    </div>
  )
}
