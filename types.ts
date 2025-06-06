// types.ts

export type DayOfWeek = '月' | '火' | '水' | '木' | '金' | '土' | '日';

export type ShiftHour = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

export interface ShiftPreference {
  day: DayOfWeek;
  hours: ShiftHour[];
}

export interface Employee {
  id: number;
  name: string;
  preferences: ShiftPreference[];
}

export interface ShiftSchedule {
  [day: string]: {
    [hour: number]: string[];
  };
}

// シフト生成のための遺伝的アルゴリズム関連の型
export interface Chromosome {
  schedule: ShiftSchedule;
  fitness: number;
}

export interface AppState {
  employeeCount: number;
  employees: Employee[];
  currentEmployeeIndex: number;
  generatedSchedule: ShiftSchedule | null;
}

export interface IsActive {
  [day: string]: {
    [hour: number]: boolean
  }
}

// 定数
export const DAYS: DayOfWeek[] = ['月', '火', '水', '木', '金', '土', '日'];
export const HOURS: ShiftHour[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
export const RANDOMMEMBERS: string[] = ['A', 'B', 'C', 'D', 'E'];