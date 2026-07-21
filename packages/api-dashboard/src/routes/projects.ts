import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import type { Project, ApiSuccess, PublicIngestKey, IngestionKeyCreatedResponse } from '@electr0zed/test-results-dashboard-api-types';
import { CreateProjectSchema, GetProjectSchema, EditProjectSchema, GetProjectIngestionKeysSchema, ModifyIngestionKeySchema, CreateIngestionKeySchema, IngestionKeyCreatedResponseSchema } from '@electr0zed/test-results-dashboard-api-types';
import { AlreadyExistsError, NotFoundError, ValidationError } from '../services/errors';
import { generateApiKey, hashApiKey } from '../services/keys';

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
    
    let body: unknown;

    try {
         body = await c.req.json();
    } catch (error) {
        throw new ValidationError('Invalid JSON body.', error);
    }
    
    const parsedBody = CreateProjectSchema.safeParse(body);

    if (!parsedBody.success) {
        throw parsedBody.error;
    }

    const existingProject = await ctx.db.project.findUnique({
        where: {
            name: parsedBody.data.name,
        },
    });

    if (existingProject) {
        throw new AlreadyExistsError(`A project with the name "${parsedBody.data.name}" already exists.`);
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

    let body: unknown;

    try {
        body = await c.req.json();
    } catch (error) {
        throw new ValidationError('Invalid JSON body.', error);
    }

    const parsedBody = EditProjectSchema.safeParse(body);

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

    if (parsedBody.data.name && parsedBody.data.name !== project.name) {
        const existingProject = await ctx.db.project.findUnique({
            where: {
                name: parsedBody.data.name,
            },
        });

        if (existingProject) {
            throw new AlreadyExistsError(`A project with the name "${parsedBody.data.name}" already exists.`);
        }
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


app.get('/:publicId/ingestion-keys', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const parsedParams = GetProjectIngestionKeysSchema.safeParse({ publicId });

    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId,
        },
        select: {
            id: true,
        },
    });

    if (!project) {
         throw new NotFoundError(`Project with publicId "${publicId}" not found.`);
    }

    const ingestionKeys = await ctx.db.ingestKey.findMany({
        select: {
            publicId: true,
            name: true,
            prefix: true,
            lastUsedAt: true,
            expiresAt: true,
            revokedAt: true,
            createdAt: true,
            updatedAt: true,
        },
        where: {
            projectId: project.id,
        }
    });

    return c.json<ApiSuccess<PublicIngestKey[]>>({ success: true, data: ingestionKeys });
});

app.post('/:publicId/ingestion-keys', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const parsedParams = GetProjectIngestionKeysSchema.safeParse({ publicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    let body: unknown;

    try {
         body = await c.req.json();
    } catch (error) {
        throw new ValidationError('Invalid JSON body.', error);
    }
    
    const parsedBody = CreateIngestionKeySchema.safeParse(body);

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

    const existingKey = await ctx.db.ingestKey.findFirst({
         where: {
             projectId: project.id,
             name: parsedBody.data.name,
         },
         select: { id: true },
     });
     if (existingKey) {
         throw new AlreadyExistsError(
             `An ingestion key with the name "${parsedBody.data.name}" already exists.`,
         );
     }

    const apiKey = generateApiKey();
    const apiKeyPrefix = apiKey.slice(0, 16);
    const apiKeyHash = await hashApiKey(apiKey);

    const ingestionKey = await ctx.db.ingestKey.create({
        data: {
            name: parsedBody.data.name,
            prefix: apiKeyPrefix,
            keyHash: apiKeyHash,
            expiresAt: parsedBody.data.expiresAt,
            projectId: project.id,
        },
    });

    const responseData = IngestionKeyCreatedResponseSchema.parse({
        ...ingestionKey,
        apiKey,
    });

    return c.json<ApiSuccess<IngestionKeyCreatedResponse>>({ success: true, data: responseData }, 201);
});

app.post('/:publicId/ingestion-keys/:keyPublicId/revoke', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const keyPublicId = c.req.param('keyPublicId');
    const parsedParams = ModifyIngestionKeySchema.safeParse({ publicId, keyPublicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const ingestionKey = await ctx.db.ingestKey.findFirst({
        where: {
            publicId: keyPublicId,
            project: {
                publicId: publicId,
            }
        }
    });

    if (!ingestionKey) {
        throw new NotFoundError(`Ingestion key with publicId "${keyPublicId}" not found for project with publicId "${publicId}".`);
    }

    await ctx.db.ingestKey.update({
        where: {
            publicId: keyPublicId,
        },
        data: {
            revokedAt: new Date(),
        },
    });

    return c.json<ApiSuccess<null>>({ success: true, data: null });
});

app.delete('/:publicId/ingestion-keys/:keyPublicId', async(c) => {
    const ctx = c.get('ctx');

    const publicId = c.req.param('publicId');
    const keyPublicId = c.req.param('keyPublicId');
    const parsedParams = ModifyIngestionKeySchema.safeParse({ publicId, keyPublicId });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const ingestionKey = await ctx.db.ingestKey.findFirst({
        where: {
            publicId: keyPublicId,
            project: {
                publicId: publicId,
            }
        }
    });

    if (!ingestionKey) {
        throw new NotFoundError(`Ingestion key with publicId "${keyPublicId}" not found for project with publicId "${publicId}".`);
    }

    await ctx.db.ingestKey.delete({
        where: {
            publicId: keyPublicId,
        },
    });

    return c.json<ApiSuccess<null>>({ success: true, data: null });
});

export default app;
