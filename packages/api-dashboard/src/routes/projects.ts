import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import type { Project, ApiSuccess, CreateProject, EditProject } from '@electr0zed/test-results-dashboard-api-types';
import { CreateProjectSchema, GetProjectSchema, EditProjectSchema } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

const app = new Hono<HonoEnv>();

app.get('/', async(c) => {
	const ctx = c.get('ctx');

    const projects = await ctx.db.project.findMany();

    return c.json<ApiSuccess<Project[]>>({ success: true, data: projects });
});

app.get('/:publicId', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const parsedParams = GetProjectSchema.safeParse({ publicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId,
        },
    });

    if (!project) {
        throw new NotFoundError(`Project with publicId "${publicId}" not found.`);
    }

    return c.json<ApiSuccess<Project>>({ success: true, data: project });
});

app.post('/', async(c) => {
    const ctx = c.get('ctx');

    const body = await c.req.json<CreateProject>();
    const parsedBody = CreateProjectSchema.safeParse(body);

    if (!parsedBody.success) {
        throw parsedBody.error;
    }

    const project = await ctx.db.project.create({
        data: {
            name: parsedBody.data.name,
        },
    });

    return c.json<ApiSuccess<Project>>({ success: true, data: project }, 201);
});

app.patch('/:publicId', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const parsedParams = GetProjectSchema.safeParse({ publicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const body = await c.req.json<Partial<EditProject>>();
    const parsedBody = EditProjectSchema.partial().safeParse(body);

    if (!parsedBody.success) {
        throw parsedBody.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId,
        },
    });

    if (!project) {
        throw new NotFoundError(`Project with publicId "${publicId}" not found.`);
    }

    const updatedProject = await ctx.db.project.update({
        where: {
            publicId,
        },
        data: {
            name: parsedBody.data.name ?? project.name,
            active: parsedBody.data.active ?? project.active,
        },
    });

    return c.json<ApiSuccess<Project>>({ success: true, data: updatedProject });
});

app.delete('/:publicId', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const parsedParams = GetProjectSchema.safeParse({ publicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId,
        },
    });

    if (!project) {
        throw new NotFoundError(`Project with publicId "${publicId}" not found.`);
    }

    await ctx.db.project.delete({
        where: {
            publicId,
        },
    });

    return c.json<ApiSuccess<null>>({ success: true, data: null });
});

export default app;
