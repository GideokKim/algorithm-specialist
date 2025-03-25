interface SolvedacUser {
  handle: string;
  solvedCount: number;
  tier: number;
  rating: number;
}

interface SolvedHistory {
  timestamp: string;  // ISO format timestamp
  value: number;      // solvedCount at this timestamp
}

interface Submission {
  problemId: number;
  timestamp: number;
  result: string;
}

export async function getUserData(handle: string): Promise<SolvedacUser | null> {
  try {
    const response = await fetch(`/api/solved?handle=${handle}&type=user`);
    
    if (response.status === 404) {
      console.log(`User ${handle} not found on solved.ac`);
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('getUserData error:', error);
    return null;
  }
}

export async function getUserSubmissions(handle: string, page: number = 1): Promise<Submission[]> {
  try {
    const response = await fetch(
      `https://solved.ac/api/v3/search/submission?query=@${handle}&page=${page}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch user submissions: ${error}`);
  }
}

export async function getMazandiImage(handle: string): Promise<string> {
  return `http://mazandi.herokuapp.com/api?handle=${handle}&theme=warm`;
}

function createSolvedDict(history: SolvedHistory[]): Record<string, number> {
  const solvedDict: Record<string, number> = {
    solved_max: 4  // Initialize with minimum value
  };
  
  // Get current time in UTC+3 (solved.ac day starts at 6AM KST)
  const now = new Date();
  const utc3Time = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const weekday = utc3Time.getDay();
  
  // Sort history by timestamp
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  let prevCount = sortedHistory[0]?.value || 0;
  
  sortedHistory.forEach(item => {
    const timestamp = new Date(item.timestamp);
    // Convert to UTC+3
    const utc3Timestamp = new Date(timestamp.getTime() + (3 * 60 * 60 * 1000));
    
    // Only consider problems solved within last 18 weeks
    const daysDiff = Math.floor((utc3Time.getTime() - utc3Timestamp.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > (120 + weekday)) {
      return;
    }
    
    const dateKey = utc3Timestamp.toISOString().split('T')[0];
    const solved = item.value - prevCount;
    
    if (solved > 0) {
      solvedDict[dateKey] = (solvedDict[dateKey] || 0) + solved;
      solvedDict.solved_max = Math.max(solvedDict.solved_max, solvedDict[dateKey]);
    }
    
    prevCount = item.value;
  });
  
  // Clamp solved_max between 4 and 50
  solvedDict.solved_max = Math.min(Math.max(solvedDict.solved_max, 4), 50);
  
  return solvedDict;
}

function calculateStreak(solvedDict: Record<string, number>): { currentStreak: number; longestStreak: number } {
  // Get current time in UTC+3
  const now = new Date();
  const utc3Time = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  utc3Time.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(utc3Time);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Calculate current streak
  const todayKey = utc3Time.toISOString().split('T')[0];
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  
  let currentStreak = 0;
  
  // Check if solved today
  if (solvedDict[todayKey]) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    
    // Check previous days
    while (true) {
      const checkKey = checkDate.toISOString().split('T')[0];
      if (!solvedDict[checkKey]) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }
  // If not solved today, check if solved yesterday
  else if (solvedDict[yesterdayKey]) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Check previous days
    while (true) {
      const checkKey = checkDate.toISOString().split('T')[0];
      if (!solvedDict[checkKey]) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }
  
  // Calculate longest streak
  let longestStreak = currentStreak;
  let tempStreak = 0;
  
  const dates = Object.keys(solvedDict)
    .filter(key => key !== 'solved_max')
    .sort();
  
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
}

export async function getUserStreak(handle: string) {
  try {
    // First verify the user exists
    const userData = await getUserData(handle);
    if (!userData) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        imageUrl: await getMazandiImage(handle)
      };
    }
    
    // Get solved history
    const response = await fetch(`/api/solved?handle=${handle}&type=history`);
    if (response.status === 404) {
      throw new Error('User not found');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch solved history');
    }
    
    const history = await response.json();
    if (!Array.isArray(history)) {
      throw new Error('Invalid history data format');
    }
    
    const solvedDict = createSolvedDict(history);
    const { currentStreak, longestStreak } = calculateStreak(solvedDict);
    
    return {
      currentStreak,
      longestStreak,
      imageUrl: await getMazandiImage(handle)
    };
  } catch (error) {
    console.error('getUserStreak error:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      imageUrl: await getMazandiImage(handle)
    };
  }
} 