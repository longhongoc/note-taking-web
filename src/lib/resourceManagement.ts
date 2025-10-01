import { db } from './firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';

export interface Resource {
  id?: string;
  title: string;
  url?: string;
  createdAt?: import('firebase/firestore').Timestamp | null;
}

// CREATE Resource
export const createResource = async (projectId: string, resource: Resource) => {
  const resourcesRef = collection(db, 'projects', projectId, 'resources');
  const docRef = await addDoc(resourcesRef, {
    ...resource,
    createdAt: Date.now(),
  });
  if (docRef) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      resourceCount: increment(1),
    });
  }
  return { id: docRef.id, ...resource };
};

// READ all Resources
export const getResources = async (projectId: string) => {
  const resourcesRef = collection(db, 'projects', projectId, 'resources');
  const snapshot = await getDocs(resourcesRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Resource[];
};

// UPDATE Resource
export const updateResource = async (
  projectId: string,
  resourceId: string,
  data: Partial<Resource>
) => {
  const resourceRef = doc(db, 'projects', projectId, 'resources', resourceId);
  await updateDoc(resourceRef, data);
};

// DELETE Resource
export const deleteResource = async (projectId: string, resourceId: string) => {
  const resourceRef = doc(db, 'projects', projectId, 'resources', resourceId);
  await deleteDoc(resourceRef).then(async () => {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      resourceCount: increment(-1),
    });
  });
};
