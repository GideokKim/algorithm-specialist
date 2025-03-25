import './globals.css';

export const metadata = {
  title: 'Solved.ac 스트릭 트래커',
  description: 'solved.ac 유저들의 문제 풀이 스트릭을 추적하는 애플리케이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
