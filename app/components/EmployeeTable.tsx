"use client";

import { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';
import { Task } from '../types/task';


export default function EmployeeTable() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    // --- 1. ФУНКЦИИ ВЗАИМОДЕЙСТВИЯ (Логика DB) ---

    // Функция переключения статуса (Выполнено/Не выполнено)
    const toggleTask = async (taskId: string, currentStatus: boolean) => {
        try {
            // doc создаёт "ссылку" на конкретный документ по его ID
            const taskRef = doc(db, 'tasks', taskId);
            // updateDoc меняет только указанные поля
            await updateDoc(taskRef, {
                completed: !currentStatus
            });
        } catch (err) {
            console.error("Ошибка при обновлении задачи:", err);
        }
    };

    // Функция удаления задачи
    const deleteTask = async (taskId: string) => {
        if (!confirm("Удалить задачу?")) return;
        try {
            // deleteDoc полностью стирает документ по ссылке
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (err) {
            console.error("Ошибка при удалении задачи:", err);
        }
    };

    useEffect(() => {
        // Подписка №1: Слушаем сотрудников
        const unsubEmp = onSnapshot(collection(db, 'employees'), (snapshot) => {
            const empList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Employee));
            setEmployees(empList);
        });

        // Подписка №2: Слушаем задачи
        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Task));
            setTasks(taskList);
        });

        // Отписываемся от обеих при закрытии страницы
        return () => {
            unsubEmp();
            unsubTasks();
        };
    }, []);

    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">ФИО</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Должность</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Премия</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Активная задача</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map((emp) => {
                        // ТЕПЕРЬ МОЖНО: мы добавили фигурные скобки и return
                        const employeeTasks = tasks.filter(t => t.employeeId === emp.id);

                        return (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-black">
                                <td className="px-4 py-3 text-sm">{emp.fullName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                    {emp.basePremium} ₽
                                </td>
                                {/* Внутри employees.map(...) в ячейке с задачами */}
                                <td className="px-4 py-3 text-sm">
                                    {employeeTasks.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {employeeTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100 group"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={task.completed}
                                                            onChange={() => toggleTask(task.id, task.completed)}
                                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className={`text-[11px] ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                            {task.title}
                                                        </span>
                                                    </div>

                                                    {/* Кнопка удаления (появляется при наведении или просто маленькая иконка) */}
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="text-red-400 hover:text-red-600 ml-2 text-[10px]"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 italic">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {employees.length === 0 && (
                <div className="text-center py-10 text-gray-400">Сотрудники не найдены</div>
            )}
        </div>
    );
}