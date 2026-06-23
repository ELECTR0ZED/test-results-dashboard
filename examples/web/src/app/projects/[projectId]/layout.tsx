import { ProjectApplicationLayout } from '@/components/layouts/project-application-layout';

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{
        projectId: string;
    }>;
}) {
    const { projectId } = await params;

    return (
        <ProjectApplicationLayout projectId={projectId}>
            {children}
        </ProjectApplicationLayout>
    );
}