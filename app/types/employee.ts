export interface Employee {
    id: string;          // int -> number
    fullName: string;    // string -> string
    position: string;
    basePremium: number; // decimal -> number (в JS всё число)
    isActive: boolean;   // bool -> boolean
    task: string;

    // Навигационные свойства (массив других интерфейсов)
    // penalties: Penalty[]; // List<Penalty> -> Penalty[] или Array<Penalty>
}