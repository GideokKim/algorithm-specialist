'use client';

import { useState, useEffect } from 'react';
import { getUserStreak, getUserData } from '../utils/solvedac';

interface RankedUser {
  handle: string;
  solvedHandle: string;
  currentStreak: number;
  maxStreak: number;
  rank: number;
  isLoading?: boolean;
}

interface UserRankingProps {
  userMapping: Record<string, string>;
}

export function UserRanking({ userMapping }: UserRankingProps) {
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateRankings = async () => {
    try {
      // Fetch current streak for all users
      const usersWithStreaks = await Promise.all(
        Object.entries(userMapping)
          .filter(([githubHandle]) => githubHandle !== "GideokKim")
          .map(async ([githubHandle, solvedHandle]) => {
            if (!solvedHandle) return null;
            try {
              const userData = await getUserData(solvedHandle);
              const { currentStreak } = await getUserStreak(solvedHandle);
              
              return { 
                handle: githubHandle,
                solvedHandle,
                currentStreak,
                maxStreak: userData?.maxStreak || 0
              };
            } catch (error) {
              console.error(`Error fetching streak for ${solvedHandle}:`, error);
              return { 
                handle: githubHandle,
                solvedHandle,
                currentStreak: 0,
                maxStreak: 0
              };
            }
          })
      );

      // Filter out null values and sort users by streak
      const sortedUsers = usersWithStreaks
        .filter(Boolean)
        .sort((a, b) => b!.currentStreak - a!.currentStreak)
        .map((user, index) => ({
          ...user!,
          rank: index + 1,
        }));

      setRankedUsers(sortedUsers);
    } catch (error) {
      console.error('Error updating rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateRankings();
    // Update rankings every hour
    const interval = setInterval(updateRankings, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">랭킹 정보를 불러오는 중...</div>;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h4>알고리즘 스터디 스트릭 랭킹</h4>
      <div>
        <strong>⚠️ 주의사항:</strong>
        <ul>
          <li><strong>현재 스트릭</strong> 계산에서 대회 코드만 제출한 날은 <em>비공식 Solved.ac</em> API에 의해 풀이 이력이 획득되지 않아 계산이 되지 않을 수 있습니다.</li>
          <li><strong>최장 스트릭</strong>은 <em>비공식 Solved.ac</em> API에 있는 수치를 가져왔기 때문에 현재 스트릭보다 낮을 수 있습니다.</li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>순위</th>
              <th>GitHub ID</th>
              <th>solved.ac</th>
              <th>현재 스트릭 / 최장 스트릭</th>
            </tr>
          </thead>
          <tbody>
            {rankedUsers.map((user) => (
              <tr key={user.handle}>
                <td>
                  <span>#{user.rank}</span>
                </td>
                <td>
                  <span>{user.handle}</span>
                </td>
                <td>
                  <span>{user.solvedHandle}</span>
                </td>
                <td>
                  <span>{user.currentStreak}일 / {user.maxStreak}일</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 