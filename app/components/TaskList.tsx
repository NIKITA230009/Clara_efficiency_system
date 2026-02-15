"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TaskItem from '@/app/components/TaskItem';
import { Task } from '@/app/types/task';

interface TaskListProps {
    userRole: string;
    selectedDate: Date;
}

export default function TaskList({ userRole, selectedDate }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Создаем границы выбранного дня для фильтрации в Firebase
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'tasks'),
            where('createdAt', '>=', start),
            where('createdAt', '<=', end)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const taskList: Task[] = [];
            querySnapshot.forEach((doc) => {
                taskList.push({ id: doc.id, ...doc.data() } as Task);
            });
            setTasks(taskList);
        });

        return () => unsubscribe();
    }, [selectedDate]);

    return (
        <ul className="space-y-4">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <TaskItem key={task.id} task={task} userRole={userRole} />
                ))
            ) : (
                <p className="text-center text-gray-400 text-xs py-4">
                    Нет задач на эту дату
                </p>
            )}
        </ul>
    );
}