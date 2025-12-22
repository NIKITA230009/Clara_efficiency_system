"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';
import { Task } from '../types/task';

export default function EmployeeTable() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]); 

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
                        const currentTask = tasks.find(t => t.employeeId === emp.id && !t.completed);

                        return (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-black">
                                <td className="px-4 py-3 text-sm">{emp.fullName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                    {emp.basePremium} ₽
                                </td>
                                <td className="px-4 py-3 text-sm italic text-blue-600">
                                    {currentTask ? currentTask.title : "—"}
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