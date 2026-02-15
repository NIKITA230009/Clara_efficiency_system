'use client';

import { initializeApp } from "firebase/app";
import { getFirestore, Firestore, doc, getDoc, setDoc } from "firebase/firestore";

// Здесь мы говорим программе: возьми эти ключи из файла .env.local
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Инициализация Firebase (только на клиенте)
let app;
let db: Firestore;

if (typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

//  функция для авторизация по id юзера
export async function getUserRole(userId: string) {
    if (!db) return 'EMPLOYEE'; // Защита, если БД еще не инициализирована

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data().role as string;
        } else {
            // Если пользователя нет в коллекции users, создаем его с ролью по умолчанию
            // Это удобно: тебе не нужно вручную добавлять каждого сотрудника, 
            // они сами появятся в базе как EMPLOYEE при первом входе.
            await setDoc(userRef, {
                role: 'EMPLOYEE',
                lastSeen: new Date().toISOString()
            });
            return 'EMPLOYEE';
        }
    } catch (error) {
        console.error("Error getting role:", error);
        return 'EMPLOYEE';
    }
}

export { db };