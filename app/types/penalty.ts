export interface Penalty {
    id: string;
    title: string;       // Сюда запишем название (например, "Опоздание на смену")
    type: string;        // Сюда запишем категорию (например, "Мелкое нарушение")
    createdAt: any;      // Date или Timestamp из Firebase
    employeeId: string;
    comment?: string;    // Можно добавить комментарий для деталей
}