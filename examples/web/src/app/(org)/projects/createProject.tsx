'use client';

import { Button } from '@/components/catalyst/button';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/catalyst/dialog';
import { Field, Label } from '@/components/catalyst/fieldset';
import { Input } from '@/components/catalyst/input';
import { useToast } from '@/contexts/toastContext';
import { createProject } from '@/lib/api/projects';
import { useState } from 'react';

export default function CreateProject({ refreshProjects }: { refreshProjects: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const { addToast } = useToast();

	const handleCreateProject = async () => {
		setLoading(true);
		try {
			await createProject({ name });
			closeDialog();
			addToast('Project created successfully', undefined, 'success');
			refreshProjects();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			addToast('Failed to create project', errorMessage, 'error');
		} finally {
			setLoading(false);
		}
	};

	const closeDialog = () => {
		if (loading) return;
		setIsOpen(false);
		setName('');
	};

	return (
		<>
			<Button type="button" onClick={() => setIsOpen(true)} className="cursor-pointer">
				New Project
			</Button>
			<Dialog open={isOpen} onClose={closeDialog} size="md">
				<DialogTitle>New Project</DialogTitle>
				<DialogBody>
					<Field>
						<Label>Name</Label>
						<Input
							type="text"
							placeholder="Project Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={loading}
						/>
					</Field>
				</DialogBody>
				<DialogActions>
					<Button type="button" onClick={closeDialog} className="cursor-pointer" plain disabled={loading}>
						Cancel
					</Button>
					<Button type="button" onClick={handleCreateProject} className="cursor-pointer" disabled={loading}>
						Create
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
