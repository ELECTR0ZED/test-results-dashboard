import { AppCtx } from "../types";

export async function verifyProjectIngestionSecret(
    ctx: AppCtx,
    projectId: string,
    providedSecret: string,
): Promise<boolean> {
    const { db } = ctx;

    const project = await db.project.findUnique({
        where: {
            publicId: projectId,
        },
        include: {
            IngestKeys: {
                where: {
                    keyhash: providedSecret,
                },
            },
        },
    });
    
    if (!project) {
        return false;
    }

    const matchingKey = project.IngestKeys.find(key => key.keyhash === providedSecret);

    if (!matchingKey) {
        return false;
    }

    // Check if the key is expired or revoked
    const now = new Date();
    if ((matchingKey.expiresAt && matchingKey.expiresAt < now) || (matchingKey.revokedAt && matchingKey.revokedAt < now)) {
        return false;
    }

    // Update lastUsedAt timestamp
    await db.ingestKey.update({
        where: { id: matchingKey.id },
        data: { lastUsedAt: now },
    });

    return true;
}