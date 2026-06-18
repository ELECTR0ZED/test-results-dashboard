import { z } from 'zod';

export const ProjectSchema = z.object({
    id: z.number(),
    publicId: z.uuid().default(() => crypto.randomUUID()),
    name: z.string(),
    active: z.boolean().default(true),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export type Project = z.infer<typeof ProjectSchema>;

export const GetProjectSchema = z.object({
    publicId: z.string(),
});

export type GetProject = z.infer<typeof GetProjectSchema>;

export const CreateProjectSchema = z.object({
    name: z.string().min(1, { message: 'Project name is required' }),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const EditProjectSchema = z.object({
    name: z.string().min(1, { message: 'Project name is required' }).optional(),
    active: z.boolean().optional(),
});

export type EditProject = z.infer<typeof EditProjectSchema>;
