'use client';

import { UserStreak } from './components/UserStreak';
import { UserRanking } from './components/UserRanking';

// GitHub 사용자명과 solved.ac 사용자명 매핑
const USER_MAPPING = {
  "GideokKim": "potatooftaebaek",
  "Bosongsae": "covertnest",
  "zer0ken": "zer0ken",
  "Yoonsoyoung02": "thdud4231",
  "trivialcoding6": "trivialcoding6",
  "ChooSeongho": "csh9895",
  "codingorijazz": "khuho777",
  "kairosial": "kairosial",
  "Ju-hong": "seesong",
  "suyeon0702": "dev_k",
  "wnsdlfrns": "jl92",
  "weg-9000": "weg1456",
  "serin826": "rin0742",
  "jiiiiiiiy": "",
  "YiHeeJu": "lehejo0330",
  "chaeengg": "bchaeeun9",
  "Kristyn-Yoon": "kristyn00",
  "yongsuk204": "yongsuk204",
  "Ryan-OH": "akrsoek0971",
  "hongwon1031": "hongwon1031"
};

const GITHUB_USERS = Object.keys(USER_MAPPING);
const SOLVED_USERS = Object.values(USER_MAPPING);

export default function Home() {
  return (
    <div className="container">
      <div className="ranking-section">
        <UserRanking userMapping={USER_MAPPING} />
      </div>
      <div className="streaks-section">
        {SOLVED_USERS.map((username) => (
          username && (
            <div key={username} className="streak-card">
              <h4>{username}&apos;s Solved.ac Streak</h4>
              <img 
                src={`https://mazandi.herokuapp.com/api?handle=${username}&theme=warm`}
                alt={`${username}'s solved.ac streak`}
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
} 