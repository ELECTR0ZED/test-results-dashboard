'use client';

import React, { useState } from 'react';
import { Field, FieldGroup, Fieldset, Label } from '@/components/catalyst/fieldset';
import { Input } from '@/components/catalyst/input';
import { Checkbox, CheckboxField } from '@/components/catalyst/checkbox';
import { useProject } from '@/contexts/projectContext';
import { Button } from '@/components/catalyst/button';
import { useToast } from '@/contexts/toastContext';
import { editProject, deleteProject } from '@/lib/api/projects';
import { Heading, Subheading } from '@/components/catalyst/heading';
import { Divider } from '@/components/catalyst/divider';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/components/catalyst/dialog';
import { useRouter } from 'next/navigation';
import { CopyBox } from '@/components/copyBox';
import IngestionKeysTable from './ingestionKeysTable';

export default function ProjectSettings() {
    const { project, setProject } = useProject();
    const { addToast } = useToast();
    const router = useRouter();

	const [name, setName] = useState(project.name);
	const [active, setActive] = useState(project.active);
	const [saving, setSaving] = useState(false);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		setSaving(true);

		try {
			const updatedProject = await editProject(project.publicId, {
				name: name.trim(),
				active,
			});

			setProject(updatedProject);

			addToast(
				'Project updated',
				'Your project settings have been saved.',
				'success',
			);
		} catch (error) {
			console.error(error);

			addToast(
				'Failed to update project',
				error instanceof Error ? error.message : 'Unknown error',
				'error',
			);
		} finally {
			setSaving(false);
		}
	}

    async function handleDeleteProject() {
        setDeleting(true);

        try {
			await deleteProject(project.publicId);

			addToast(
				'Project deleted',
				'Your project has been deleted successfully.',
				'success',
			);

            router.replace('/projects');
		} catch (error) {
			console.error(error);

			addToast(
				'Failed to delete project',
				error instanceof Error ? error.message : 'Unknown error',
				'error',
			);

            setDeleting(false);
		}
    }

    const closeDeleteDialog = () => {
		if (deleting) return;
		setIsDeleteOpen(false);
	}

    return (
        <>
            <div className="mx-auto space-y-8">
                <section>
                    <div>
                        <Heading level={2}>Project Information</Heading>
                        <Subheading>View your project details below.</Subheading>
                        <Divider className="mb-4" />
                    </div>
                    <div className="max-w-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <strong>Project ID:</strong>
                            <CopyBox value={project.publicId} />
                        </div>
                    </div>
                </section>
                <section>
                    <div>
                        <Heading level={2}>Ingestion Key</Heading>
                        <Subheading>Your ingestion key is used to send test results to this project.</Subheading>
                        <Divider className="mb-4" />
                    </div>
                    <div className="space-y-2 mx-auto">
                        <IngestionKeysTable />
                    </div>
                </section>
                <section>
                    <div>
                        <Heading level={2}>Edit Project</Heading>
                        <Subheading>Update your project settings below.</Subheading>
                        <Divider className="mb-4" />
                    </div>
                    <div className="max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <Fieldset>
                                <FieldGroup>
                                    <Field>
                                        <Label>Project Name</Label>
                                        <Input type="text" placeholder="Enter project name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </Field>
                                    <CheckboxField>
                                        <Label>Is Project Active</Label>
                                        <Checkbox name="isActive" checked={active} onChange={setActive} />
                                    </CheckboxField>
                                </FieldGroup>
                            </Fieldset>
                            <div className="flex mt-4">
                                <Button type="submit" className="cursor-pointer" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </section>
                <section>
                    <div className="mx-auto">
                        <Heading level={2}>Danger Zone</Heading>
                        <Subheading>Delete this project and all associated data. This action cannot be undone.</Subheading>
                        <Divider className="mb-4" />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button type="button" className="cursor-pointer" color="red" onClick={() => setIsDeleteOpen(true)}>
                            Delete Project
                        </Button>
                    </div>
                </section>
            </div>
            <Dialog open={isDeleteOpen} onClose={closeDeleteDialog} size="md">
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this project? This action cannot be undone and will permanently remove all associated data.
                </DialogDescription>
                <DialogActions>
                    <Button type="button" onClick={closeDeleteDialog} className='cursor-pointer' plain disabled={deleting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleDeleteProject} className='cursor-pointer' color="red" disabled={deleting}>
                        Delete Project
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
