"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLaunchParams } from "@telegram-apps/sdk-react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), { ssr: false });

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>("Инициализация...");
  
  // Попробуем достать параметры через SDK
  let launchParams: any = null;
  try {
    launchParams = useLaunchParams();
  } catch (e) {}

  useEffect(() => {
    // Эта функция соберет все данные, которые видит приложение
    const runDiagnostics = () => {
      let log = "--- DIAGNOSTICS ---\n";
      
      // 1. Проверяем URL браузера (самое надежное)
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'N/A';
      log += `URL: ${currentUrl}\n\n`;

      // 2. Ищем параметр вручную в хеше (#) и поиске (?)
      let rawParam = null;
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        const search = window.location.search;
        
        // Telegram может передавать данные в tgWebAppStartParam
        const urlParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace('#', ''));
        
        const fromSearch = urlParams.get('tgWebAppStartParam');
        const fromHash = hashParams.get('tgWebAppStartParam');
        
        log += `Search Param: ${fromSearch || 'нет'}\n`;
        log += `Hash Param: ${fromHash || 'нет'}\n`;
        
        rawParam = fromSearch || fromHash;
      }

      // 3. Проверяем SDK
      const sdkParam = launchParams?.startParam;
      log += `SDK Param: ${sdkParam || 'нет'}\n`;

      // ИТОГОВОЕ РЕШЕНИЕ
      const finalParam = rawParam || sdkParam;

      if (finalParam) {
        log += `\n✅ НАЙДЕН КОД: ${finalParam}\n`;
        try {
          // Восстанавливаем Base64 (возвращаем =)
          let base64 = String(finalParam).replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const decoded = atob(base64);
          log += `🔓 DECODED: ${decoded}`;
          setGroupId(decoded);
        } catch (e: any) {
          log += `❌ Ошибка декодирования: ${e.message}`;
        }
      } else {
        log += `\n⛔ ПАРАМЕТР НЕ НАЙДЕН.\nПопробуйте перезапустить бота.`;
      }

      setDebugLog(log);
    };

    // Даем 500мс на полную загрузку Telegram
    setTimeout(runDiagnostics, 500);
    
  }, [launchParams]);

  if (!groupId) {
    return (
      <div className="p-4 font-mono text-xs break-all bg-gray-100 min-h-screen text-black">
        <h1 className="text-lg font-bold mb-4 text-red-600">РЕЖИМ ОТЛАДКИ</h1>
        <pre className="whitespace-pre-wrap">{debugLog}</pre>
        <div className="mt-8 text-gray-500">
          Сделайте скриншот этого экрана, если ID не определился.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 font-sans">
      <header className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          ID: {groupId}
        </span>
      </header>
      <main className="flex flex-col gap-8">
        <TaskForm groupId={groupId} />
        <TaskList groupId={groupId} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
}