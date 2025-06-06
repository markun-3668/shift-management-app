// contexts/ShiftContext.tsx

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Employee, ShiftSchedule } from '../types';

// 初期状態
const initialState: AppState = {
  employeeCount: 0,
  employees: [],
  currentEmployeeIndex: 0,
  generatedSchedule: null,
};

// アクションタイプ
type ActionType =
  | { type: 'SET_EMPLOYEE_COUNT'; payload: number }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { index: number; employee: Employee } }
  | { type: 'SET_CURRENT_EMPLOYEE_INDEX'; payload: number }
  | { type: 'SET_GENERATED_SCHEDULE'; payload: ShiftSchedule }
  | { type: 'RESET' };

// Reducer
const shiftReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_EMPLOYEE_COUNT':
      return {
        ...state,
        employeeCount: action.payload,
        employees: [],
        currentEmployeeIndex: 0,
      };
    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload],
        currentEmployeeIndex: state.currentEmployeeIndex + 1,
      };
    case 'UPDATE_EMPLOYEE':
      const updatedEmployees = [...state.employees];
      updatedEmployees[action.payload.index] = action.payload.employee;
      return {
        ...state,
        employees: updatedEmployees,
      };
    case 'SET_CURRENT_EMPLOYEE_INDEX':
      return {
        ...state,
        currentEmployeeIndex: action.payload,
      };
    case 'SET_GENERATED_SCHEDULE':
      return {
        ...state,
        generatedSchedule: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// コンテキスト
type ShiftContextType = {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

// プロバイダー
export const ShiftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(shiftReducer, initialState);

  return (
    <ShiftContext.Provider value={{ state, dispatch }}>
      {children}
    </ShiftContext.Provider>
  );
};

// カスタムフック
export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
};