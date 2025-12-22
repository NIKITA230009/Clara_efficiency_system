"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';

export default function TaskForm() {
    const [title, setTitle] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Подгружаем список сотрудников для выпадающего списка
    useEffect(() => {
        const fetchEmployees = async () => {
            const querySnapshot = await getDocs(collection(db, 'employees'));
            const emps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(emps);
        };
        fetchEmployees();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !selectedEmployeeId || !db) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'tasks'), {
                title: title.trim(),
                completed: false,
                createdAt: new Date(),
                employeeId: selectedEmployeeId, // Ключевое изменение: привязка к человеку
            });

            setTitle('');
            setSelectedEmployeeId('');
        } catch (err) {
            console.error('Error adding task:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Выбор сотрудника */}
            <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
                required
            >
                <option value="">Выберите сотрудника...</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
            </select>

            {/* Текст задачи */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать?"
                className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Сохранение...' : 'Назначить задачу'}
            </button>
        </form>
    );
}