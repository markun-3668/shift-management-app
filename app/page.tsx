// app/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShiftContext } from '../contexts/ShiftContext';

export default function HomePage() {
  const [count, setCount] = useState<number>(1);
  const { dispatch } = useShiftContext();
  const router = useRouter();

  const handleSubmitSelect = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_EMPLOYEE_COUNT', payload: count });
    router.push('/input-shifts');
  };

  const handleSubmitRandom = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_EMPLOYEE_COUNT', payload: count });
    router.push('/input-random');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmitSelect} className='p-6'>
          <div className="mb-6">
            <label htmlFor="employee-count" className="block text-gray-700 font-medium mb-2">
              アルバイトメンバーの人数を選択してください
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="employee-count"
                min="1"
                max="5"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xl font-bold">{count}人</span>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" className="btn-primary w-full">
              次へ：シフト希望入力
            </button>
          </div>
        </form>
        <form onSubmit={handleSubmitRandom} className='p-6'>
          <div className="text-center">
            <button type="submit" className="btn-primary w-full">
              ランダム生成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}