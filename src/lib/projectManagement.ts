// lib/projectService.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Định nghĩa kiểu dữ liệu Project
export interface Project {
  id?: string;
  title: string;
  color: string;
  resourceCount: number;
  noteCount: number;
  createdAt?: import('firebase/firestore').Timestamp | null;
  updatedAt?: import('firebase/firestore').Timestamp | null;
}

// CREATE
export async function createProject(
  title: string,
  color: string
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      title,
      color,
      resourceCount: 0,
      noteCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

// READ ALL
export async function getAllProjects(): Promise<Project[]> {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

// READ ONE PROJECT
export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  const docRef = doc(db, 'projects', projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  } else {
    return null;
  }
}

// UPDATE
export async function updateProject(
  projectId: string,
  title: string,
  color: string
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    title: title,
    color: color,
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteProject(projectId: string): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  const notesSnap = await getDocs(
    collection(db, 'projects', projectId, 'notes')
  );
  for (const note of notesSnap.docs) {
    await deleteDoc(note.ref);
  }
  const resourcesSnap = await getDocs(
    collection(db, 'projects', projectId, 'resources')
  );
  for (const res of resourcesSnap.docs) {
    await deleteDoc(res.ref);
  }
  await deleteDoc(projectRef);
}

export const listenTotalCounts = (
  callback: (counts: { totalNotes: number; totalResources: number }) => void
) => {
  const projectsRef = collection(db, 'projects');
  return onSnapshot(projectsRef, (snapshot) => {
    let totalNotes = 0;
    let totalResources = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalNotes += data.noteCount || 0;
      totalResources += data.resourceCount || 0;
    });

    callback({ totalNotes, totalResources });
  });
};
