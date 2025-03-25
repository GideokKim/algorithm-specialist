import { NextResponse } from 'next/server';

const SOLVED_AC_API = 'https://solved.ac/api/v3';

async function fetchFromSolvedAC(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 404) {
      console.log(`Solved.ac API: User not found at ${url}`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Solved.ac API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const type = searchParams.get('type') || 'user';

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    const data = await fetchFromSolvedAC(
      type === 'history'
        ? `${SOLVED_AC_API}/user/history?handle=${handle}&topic=solvedCount`
        : `${SOLVED_AC_API}/user/show?handle=${handle}`
    );

    if (data === null) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from solved.ac' },
      { status: 500 }
    );
  }
} 