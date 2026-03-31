import './globals.css';

export const metadata = {
  title: 'Biology Lab - Onion Root Tip Mitosis',
  description: 'A virtual biology laboratory simulation for onion root tip mitosis experiment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
