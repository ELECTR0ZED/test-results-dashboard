import { ToastProvider } from '@/contexts/toastContext';
import '@/styles/tailwind.css';
import type { Metadata } from 'next';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: {
		template: '%s - Test Results Dashboard',
		default: 'Home',
	},
	description: '',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
		>
			<head>
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
			<body>
				<ToastProvider>{children}</ToastProvider>
			</body>
		</html>
	);
}
