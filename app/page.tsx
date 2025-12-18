"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import dynamic from 'next/dynamic';

// Создаем клиентский компонент для работы в Mini App
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Безопасно получаем параметры запуска Telegram
  let launchParams: any = null;
  try {
    launchParams = useLaunchParams();
  } catch (e) {
    console.error("SDK Error:", e);
  }

  useEffect(() => {
    const initializeComponent = () => {
      try {
        if (launchParams?.startParam) {
          const encodedGroupId = String(launchParams.startParam);
          try {
            // Исправленная типизация для atob
            const decodedGroupId = atob(encodedGroupId as string);
            console.log("Decoded Group ID:", decodedGroupId);
            setGroupId(decodedGroupId);
          } catch (err) {
            console.error("Error decoding group ID:", err);
            setError("Invalid group ID format");
          }
        } else {
          console.log("No start_param available");
          setError("No group ID provided. Please open the app from a Telegram group.");
        }
      } catch (err) {
        console.error("Error in initializeComponent:", err);
        setError("An error occurred while initializing the component");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [launchParams]);

  if (isLoading) {
    return <div className="p-8 font-sans">Загрузка данных...</div>;
  }

  if (error && !groupId) {
    return (
      <div className="p-8 text-red-500 font-sans">
        <h2 className="text-xl font-bold mb-2">Упс! Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 font-sans">
      <header className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Task Board</h1>
        {groupId && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Group ID: {groupId}
          </span>
        )}
      </header>

      <main className="flex flex-col gap-8">
        {groupId && (
          <>
            <TaskForm groupId={groupId} />
            <TaskList groupId={groupId} />
          </>
        )}
      </main>

      <footer className="flex justify-center text-sm text-gray-500 pt-4 border-t">
        Powered by Clara Efficiency System
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Инициализация...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
}