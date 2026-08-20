'use client';

import { Navbar } from '@/components/catalyst/navbar';
import {
	Sidebar,
	SidebarBody,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
} from '@/components/catalyst/sidebar';
import { SidebarLayout } from '@/components/catalyst/sidebar-layout';
import { FolderIcon } from '@heroicons/react/20/solid';
import { usePathname } from 'next/navigation';

export function OrgApplicationLayout({ children }: { children: React.ReactNode }) {
	let pathname = usePathname();

	return (
		<SidebarLayout
			navbar={<Navbar></Navbar>}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<SidebarItem href="/">
							<SidebarLabel>Test Results</SidebarLabel>
						</SidebarItem>
					</SidebarHeader>
					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/projects" current={pathname === '/projects'}>
								<FolderIcon />
								<SidebarLabel>Projects</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					</SidebarBody>
				</Sidebar>
			}
		>
			{children}
		</SidebarLayout>
	);
}
