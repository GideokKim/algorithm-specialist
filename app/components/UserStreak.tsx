'use client';

import { useState } from 'react';
import { getUserData, getUserStreak } from '../utils/solvedac';

interface User {
  handle: string;
  currentStreak: number;
  longestStreak: number;
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
}

export function UserStreak() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const handle = newUser.trim();

    try {
      // Add user immediately with loading state
      setUsers(prev => [...prev, { handle, currentStreak: 0, longestStreak: 0, isLoading: true }]);
      setNewUser('');

      // Fetch user data
      await getUserData(handle); // Verify user exists
      const { currentStreak, longestStreak, imageUrl } = await getUserStreak(handle);

      // Update user with streak data
      setUsers(prev => 
        prev.map(user => 
          user.handle === handle
            ? { handle, currentStreak, longestStreak, imageUrl }
            : user
        )
      );

      // Store the user in localStorage
      const savedUsers = JSON.parse(localStorage.getItem('trackedUsers') || '[]');
      if (!savedUsers.includes(handle)) {
        localStorage.setItem('trackedUsers', JSON.stringify([...savedUsers, handle]));
      }
    } catch (error) {
      setUsers(prev => 
        prev.map(user => 
          user.handle === handle
            ? { ...user, isLoading: false, error: '유저를 찾을 수 없습니다.' }
            : user
        )
      );
      console.error('Error adding user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addUser} className="flex gap-4">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="solved.ac 유저명 입력"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로딩중...' : '추가'}
        </button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.handle} className="card">
            <h3 className="text-2xl font-semibold">{user.handle}</h3>
            <div className="space-y-6">
              {user.isLoading ? (
                <p className="text-gray-500">로딩중...</p>
              ) : user.error ? (
                <p className="text-red-500">{user.error}</p>
              ) : (
                <>
                  {user.imageUrl && (
                    <div className="streak-image">
                      <img src={user.imageUrl} alt={`${user.handle}의 스트릭`} />
                    </div>
                  )}
                  <p>현재 스트릭: {user.currentStreak}일</p>
                  <p>최장 스트릭: {user.longestStreak}일</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 