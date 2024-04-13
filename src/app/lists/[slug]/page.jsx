"use client"
import { useState, useEffect } from 'react';
import { auth, firestore } from '../../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../page.module.css'


export default function List() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editedTodo, setEditedTodo] = useState('');
  const router = useRouter();
  const pathName = usePathname();
  const listId = pathName.split('/lists/')[1];
  const [listName, setListName] = useState('');

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
      if (user && listId) {
        const listDoc = doc(firestore, 'lists', listId);
        const listSnapshot = await getDoc(listDoc);
  
        if (listSnapshot.exists()) {
          const listData = listSnapshot.data();
          const listOwner = listData.userId;
  
          if (listOwner !== user.uid) {
            router.push('/lists');
            return;
          }
  
          const todoRef = collection(firestore, 'todos');
          const q = query(todoRef, where('listId', '==', listId));
          unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            const updatedTodos = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTodos(updatedTodos);
          });
  
          setListName(listData.name);
        } else {
          router.push('/lists');
        }
      }
    };
  
    fetchTodos();
  
    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user, listId, router]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      if(user && listId){
        const todoRef = collection(firestore, 'todos');
        await addDoc(todoRef, {
        userId: user.uid,
        listId: listId,
        title: newTodo.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      });
      setNewTodo('');
      }
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
    <h1>{listName}</h1>
      <div className = {styles.list}>
      <div className={styles.listItem}>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add new task"
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
                  className={styles.addInput}
                />
                <button onClick={() => editTodo(todo.id, editedTodo)} className={styles.addButton}>
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
