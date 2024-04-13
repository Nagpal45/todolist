"use client"
import { useState, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'


export default function Todo() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editedTodo, setEditedTodo] = useState('');
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

    const fetchTodos = async () => {
      if (user) {
        const todoRef = collection(firestore, 'todos');
        const q = query(todoRef, where('userId', '==', user.uid));
        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const updatedTodos = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(updatedTodos);
        });
      }
    };

    fetchTodos();

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const todoRef = collection(firestore, 'todos');
      await addDoc(todoRef, {
        userId: user.uid,
        title: newTodo.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      });
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error.message);
    }
  };

  const editTodo = async (todoId, updatedTitle) => {
    try {
      const todoDoc = doc(firestore, 'todos', todoId);
      await updateDoc(todoDoc, { title: updatedTitle });
      setEditTodoId(null);
    } catch (error) {
      console.error('Error updating todo:', error.message);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const todoDoc = doc(firestore, 'todos', todoId);
      await deleteDoc(todoDoc);
    } catch (error) {
      console.error('Error deleting todo:', error.message);
    }
  };


  if (!user) return null;

  return (
    <div className={styles.listPage}>
    <h1>ListName</h1>
      <div className = {styles.list}>
      <div className={styles.listItem}>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add new todo"
        className={styles.addInput}
      />
      <button className={styles.addButton} onClick={addTodo}>Add</button>
      </div>
        {
          todos.length > 0 ? (
            todos?.map((todo) => (
          <>
          <div key={todo.id} className={styles.listItem}>
            {editTodoId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editedTodo}
                  onChange={(e) => setEditedTodo(e.target.value)}
                />
                <button onClick={() => editTodo(todo.id, editedTodo)}>
                  Save
                </button>
              </>
            ) : (
              <>
                {todo.title}
                <div>
                <button onClick={() => {
                  setEditTodoId(todo.id);
                  setEditedTodo(todo.title);
                }} className={styles.editButton}>
                  Edit
                </button>
                <button className={styles.deleteButton} onClick={() => { deleteTodo(todo.id) }}>Delete</button>
                </div>
              </>
            )}
          </div>
          <div className={styles.sepLine}></div>
          </>
        ))
          ):(
            <p className={styles.nothing}>Don&apos;t remember, just add here</p>
          )
        }
      </div>
    </div>

  );
}
