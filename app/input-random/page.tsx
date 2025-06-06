// app/input-random/page.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useShiftContext } from '../../contexts/ShiftContext';
import { ShiftPreference, ShiftSchedule, DayOfWeek, ShiftHour, Employee, RANDOMMEMBERS } from '../../types';

export default function InputRandomPage() {
    const { state, dispatch } = useShiftContext();
    const router = useRouter();
    const formRef = useRef<HTMLDivElement>(null);
  
    // 初期化されていない場合はホームにリダイレクト
    useEffect(() => {
      if (state.employeeCount === 0) {
        router.push('/');
      }
    }, [state.employeeCount, router]);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

    randomGenerateSchedule();
  
      // 確認ページへ
      router.push('/confirm');
    };

    const randomGenerateSchedule = () => {

        const employees: Employee[] = [];
        const days: DayOfWeek[] = ['月', '火', '水', '木', '金', '土', '日'];
        const hours: ShiftHour[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

        // 結果となるシフトスケジュール
        const schedule: ShiftSchedule = {};

        for (let i = 0; i < state.employeeCount; i++) {
            // ランダムな希望シフトを生成
            const preferences: ShiftPreference[] = [];
            
            // ランダムな曜日数（1〜7日）を選択
            const preferredDaysCount = Math.floor(Math.random() * 7) + 1;
            const shuffledDays = [...days].sort(() => 0.5 - Math.random());
            const preferredDays = shuffledDays.slice(0, preferredDaysCount);
            
            for (const day of preferredDays) {
              // ランダムな時間数（1〜17時間）を選択
              const preferredHoursCount = Math.floor(Math.random() * 17) + 1;
              const shuffledHours = [...hours].sort(() => 0.5 - Math.random());
              const preferredHours = shuffledHours.slice(0, preferredHoursCount) as ShiftHour[];
              
              preferences.push({
                day,
                hours: preferredHours
              });
            }
            
            // 従業員を追加
            employees.push({
              id: i,
              name: RANDOMMEMBERS[i], // 名前が足りない場合はループ
              preferences
            });
        }
        
        // 各曜日について処理
        for (const day of days) {
          schedule[day] = {};
          
          // 各時間帯について処理
          for (const hour of hours) {
            // この時間帯に勤務可能な従業員をフィルタリング
            const availableEmployees = employees.filter(employee => 
              employee.preferences.some(pref => 
                pref.day === day && pref.hours.includes(hour as ShiftHour)
              )
            );
            
            // ランダムに0〜2人の従業員を選択
            const maxStaff = Math.min(Math.floor(Math.random() * 3), availableEmployees.length);
            const selectedEmployees: string[] = [];
            
            // 従業員をシャッフルしてランダムに選択
            const shuffled = [...availableEmployees].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < maxStaff; i++) {
              selectedEmployees.push(shuffled[i].name);
            }
            
            // 選択された従業員をスケジュールに追加
            schedule[day][hour] = selectedEmployees;
          }
        }
        
        for(let i = 0; i < state.employeeCount; i++) {
          dispatch({ type: 'ADD_EMPLOYEE', payload: employees[i] });
        }
    }
  
    return (
        <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md" ref={formRef}>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              ランダム希望シフト生成
            </h2>
            <p className="text-gray-600">
              ランダムで{state.employeeCount}人分の従業員の希望シフトを生成します。
            </p>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div className="text-center">
              <button type="submit" className="btn-primary w-full md:w-auto">
                確認へ進む
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }