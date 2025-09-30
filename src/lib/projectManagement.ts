// lib/projectService.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
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
  data: Partial<Project>
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
}
