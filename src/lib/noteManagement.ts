import { db } from './firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: import('firebase/firestore').Timestamp | null;
}
// CREATE Note
export const createNote = async (projectId: string, note: Note) => {
  const notesRef = collection(db, 'projects', projectId, 'notes');
  const docRef = await addDoc(notesRef, {
    ...note,
    createdAt: Date.now(),
  });
  return { id: docRef.id, ...note };
};

// READ all Notes
export const getNotes = async (projectId: string) => {
  const notesRef = collection(db, 'projects', projectId, 'notes');
  const snapshot = await getDocs(notesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Note[];
};

// UPDATE Note
export const updateNote = async (
  projectId: string,
  noteId: string,
  data: Partial<Note>
) => {
  const noteRef = doc(db, 'projects', projectId, 'notes', noteId);
  await updateDoc(noteRef, data);
};

// DELETE Note
export const deleteNote = async (projectId: string, noteId: string) => {
  const noteRef = doc(db, 'projects', projectId, 'notes', noteId);
  await deleteDoc(noteRef);
};
