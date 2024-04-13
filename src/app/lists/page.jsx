"use client"
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp, addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import styles from './page.module.css'

export default function Lists() {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [user, setUser]= useState()
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
          if (authUser) {
            setUser(authUser);
          } else {
            setUser(null);
            router.push('/login')
          }
        });
    
        return () => unsubscribe();
      }, [router]);
  
      useEffect(() => {
        let unsubscribeSnapshot;
    
        const fetchLists = async () => {
          if (user) {
            const todoRef = collection(firestore, 'lists');
            const q = query(todoRef, where('userId', '==', user.uid));
            unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
              const updatedLists = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setLists(updatedLists);
            });
          }
        };
    
        fetchLists();
    
        return () => {
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
          }
        };
      }, [user]);
  
    const handleCreateList = async () => {
      if (newListName.trim() !== '') {
        try {
            const todoRef = collection(firestore, 'lists');
            await addDoc(todoRef, {
              userId: user.uid,
              name: newListName,
              createdAt: Timestamp.fromDate(new Date()),
            });
            setNewListName('');
          } catch (error) {
            console.error('Error adding todo:', error.message);
          }
      }
    };

    const deleteList = async (listId) => {
      try {
        const listDoc = doc(firestore, 'lists', listId);
        await deleteDoc(listDoc);
      } catch (error) {
        console.error('Error deleting todo:', error.message);
      }
    };
  
    return (
      <div className={styles.listPage}>
        <h1>Your ToDo Lists</h1>
        <div className={styles.list}>
          <div className={styles.listItem}>
          <input
            type="text"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="Enter list name"
            className={styles.addInput}
          />
          <button onClick={handleCreateList} className={styles.addButton}>Create List</button>
          </div>
          {lists.length > 0 ? (
            lists.map(list => (
            <div  key={list.id} className={styles.listItem}>
            {list.name}
            <div>
                <Link  href={`/lists/${list.id}`}><button style={{backgroundColor: 'rgb(32, 168, 252)'}} className={styles.editButton}>
                  Open List
                </button></Link>
                <button className={styles.deleteButton} onClick={() => { deleteList(list.id) }}>Delete</button>
                </div>
            </div>
          ))
          ):(
            <p className={styles.nothing}>Create Different lists for different needs</p>
          )}
        </div>
      </div>
    );
  }
