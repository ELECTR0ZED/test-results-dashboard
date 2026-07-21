'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProject } from '@/contexts/projectContext';
import { PublicIngestKey } from '@electr0zed/test-results-dashboard-api-types';
import { createIngestionKey, getProjectIngestionKeys } from '@/lib/api/projects';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/catalyst/table';
import { Button } from '@/components/catalyst/button';
import { revokeIngestionKey, deleteIngestionKey } from '@/lib/api/projects';
import { useToast } from '@/contexts/toastContext';
import { DialogBody, DialogActions, Dialog, DialogTitle, DialogDescription } from '@/components/catalyst/dialog';
import { Field, FieldGroup, Fieldset, Label } from '@/components/catalyst/fieldset';
import { Input } from '@/components/catalyst/input';
import { CopyBox } from '@/components/copyBox';

export default function IngestionKeysTable() {
    const { project } = useProject();
    const { addToast } = useToast();
    const [keys, setKeys] = useState<PublicIngestKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [creating, setCreating] = useState(false);
    const [keyName, setKeyName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const [isKeyOpen, setIsKeyOpen] = useState(false);
    const [newKey, setNewKey] = useState('');

    const fetchIngestionKeys = useCallback(async () => {
        setLoading(true);
        setKeys([]);
        try {
            const ingestionKeys = await getProjectIngestionKeys(project.publicId);
            setKeys(ingestionKeys);
        } catch (error) {
            console.error('Failed to fetch ingestion keys:', error);
        } finally {
            setLoading(false);
        }
    }, [project.publicId]);

    useEffect(() => {
        fetchIngestionKeys();
    }, [fetchIngestionKeys]);

    async function handleRevoke(keyId: string) {
        try {
            await revokeIngestionKey(project.publicId, keyId);
            setKeys((prevKeys) =>
                prevKeys.map((key) =>
                    key.publicId === keyId ? { ...key, revokedAt: new Date() } : key
                )
            );
            addToast('Ingestion key revoked', 'The ingestion key has been revoked successfully.', 'success');
        } catch (error) {
            console.error('Failed to revoke ingestion key:', error);
        }
    }

    async function handleDelete(keyId: string) {
        try {
            await deleteIngestionKey(project.publicId, keyId);
            setKeys((prevKeys) => prevKeys.filter((key) => key.publicId !== keyId));
            addToast('Ingestion key deleted', 'The ingestion key has been deleted successfully.', 'success');
        } catch (error) {
            console.error('Failed to delete ingestion key:', error);
        }
    }

    async function handleCreateIngestionKey() {
        setCreating(true);

        try {
            const newIngestionKey = await createIngestionKey(
                project.publicId,
                keyName.trim(),
                expiresAt ? new Date(expiresAt) : null
            );

            fetchIngestionKeys();

            setNewKey(newIngestionKey.apiKey);
            setIsKeyOpen(true);
        } catch (error) {
            console.error(error);

            addToast(
                'Failed to create ingestion key',
                error instanceof Error ? error.message : 'Unknown error',
                'error',
            );
        } finally {
            setCreating(false);
            closeCreateDialog();
        }
    }

    const closeCreateDialog = () => {
        if (creating) return;
        setIsCreateOpen(false);
        setKeyName('');
        setExpiresAt('');
    }

    const closeKeyDialog = () => {
        if (creating) return;
        setIsKeyOpen(false);
        setNewKey('');
    }

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Key</TableCell>
                        <TableCell>Last Used</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow className="animate-pulse mx-auto">
                            <TableCell colSpan={5}>Loading...</TableCell>
                        </TableRow>
                    ) : keys.length === 0 ? (
                        <TableRow className='mx-auto'>
                            <TableCell colSpan={5}>No ingestion keys found.</TableCell>
                        </TableRow>
                    ) : (
                        keys.map((key) => {
                            const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                            const statusLabel = key.revokedAt ? 'Revoked' : isExpired ? 'Expired' : null;
                            return (
                                <TableRow key={key.publicId}>
                                    <TableCell>{key.name}{statusLabel && ` (${statusLabel})`}</TableCell>
                                    <TableCell>{key.prefix}...</TableCell>
                                    <TableCell>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}</TableCell>
                                    <TableCell>{key.expiresAt ? new Date(key.expiresAt).toLocaleString() : 'Never'}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button onClick={() => handleRevoke(key.publicId)} disabled={!!(key.revokedAt || isExpired)} className={!!(key.revokedAt || isExpired) ? 'cursor-not-allowed' : 'cursor-pointer'}>Revoke</Button>
                                        <Button onClick={() => handleDelete(key.publicId)} className="cursor-pointer">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            <div className="flex mt-4">
                <Button type="submit" className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                    Create New Ingestion Key
                </Button>
            </div>

            <Dialog open={isCreateOpen} onClose={closeCreateDialog} size="md">
                <DialogTitle>Create Ingestion Key</DialogTitle>
                <DialogBody>
                    <Fieldset>
                        <FieldGroup>
                            <Field>
                                <Label>Key Name</Label>
                                <Input type="text" placeholder="Enter key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
                            </Field>
                            <Field>
                                <Label>Expires At (Optional)</Label>
                                <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                            </Field>
                        </FieldGroup>
                    </Fieldset>
                </DialogBody>
                <DialogActions>
                    <Button type="button" onClick={closeCreateDialog} className='cursor-pointer' plain disabled={creating}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateIngestionKey} className='cursor-pointer' disabled={creating}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isKeyOpen} onClose={closeKeyDialog} size="lg">
                <DialogTitle>Ingestion Key Created</DialogTitle>
                <DialogDescription>
                    Your new ingestion key has been created. Please copy and store it securely, as it will not be shown again.
                </DialogDescription>
                <DialogBody>
                    <CopyBox value={newKey} />
                </DialogBody>
                <DialogActions>
                    <Button type="button" onClick={closeKeyDialog} className='cursor-pointer'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
