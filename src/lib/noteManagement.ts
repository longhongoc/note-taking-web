import { db } from './firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
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
  if (docRef) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      noteCount: increment(1),
    });
  }
  return { id: docRef.id, ...note };
};

// READ all Notes
export const getNotes = async (projectId: string) => {
  const notesRef = collection(db, 'projects', projectId, 'notes');
  const snapshot = await getDocs(notesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Note[];
};

// READ one Note
export const getNote = async (
  projectId: string,
  noteId: string
): Promise<Note | null> => {
  try {
    const noteRef = doc(db, 'projects', projectId, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists()) {
      return {
        id: noteSnap.id,
        ...noteSnap.data(),
      } as Note;
    } else {
      console.log('Note not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching note:', error);
    return null;
  }
};

// UPDATE Note
export const updateNote = async (
  projectId: string,
  noteId: string,
  title: string,
  content: string
) => {
  const noteRef = doc(db, 'projects', projectId, 'notes', noteId);
  await updateDoc(noteRef, {
    title: title,
    content: content,
    createdAt: serverTimestamp(),
  });
};

// DELETE Note
export const deleteNote = async (projectId: string, noteId: string) => {
  const noteRef = doc(db, 'projects', projectId, 'notes', noteId);
  await deleteDoc(noteRef).then(async () => {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      noteCount: increment(-1),
    });
  });
};
