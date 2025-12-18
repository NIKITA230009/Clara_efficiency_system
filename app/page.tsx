"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import dynamic from 'next/dynamic';

// Créer un composant client-only pour le TaskBoard
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const launchParams = useLaunchParams();

  // Вместо старого блока используй этот:
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Попробуем достать параметр напрямую из URL, если SDK капризничает
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const startAppParam = urlParams.get('tgWebAppStartParam') || launchParams?.startParam;

      if (startAppParam) {
        try {
          const decoded = atob(startAppParam as string);
          setGroupId(decoded);
          setError(null);
        } catch (e) {
          console.error("Decoding error", e);
          setError("Invalid ID format");
        }
      }
    }
  }, [launchParams]);

  initializeComponent();
}, [launchParams]);

if (isLoading) {
  return <div className="p-8">Loading...</div>;
}

if (error) {
  return <div className="p-8 text-red-500">{error}</div>;
}

if (!groupId) {
  return <div className="p-8">Please provide a valid group ID</div>;
}

return (
  <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8">
    <header className="flex items-center justify-between">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={100}
        height={20}
        priority
      />
      <h1 className="text-2xl font-bold">Task Board - Group {groupId}</h1>
    </header>

    <main className="flex flex-col gap-8">
      <TaskForm groupId={groupId} />
      <TaskList groupId={groupId} />
    </main>

    <footer className="flex justify-center text-sm text-gray-500">
      Powered by Next.js
    </footer>
  </div>
);
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
}