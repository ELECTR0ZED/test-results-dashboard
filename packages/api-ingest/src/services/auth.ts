import type { AppCtx } from "../types";

export async function verifyProjectIngestionSecret(
    ctx: AppCtx,
    projectId: string,
    providedSecret: string,
): Promise<boolean> {
    const { db } = ctx;

    const hashedProvidedSecret = await hashApiKey(providedSecret);

    const matchingKey = await db.ingestKey.findFirst({
        where: {
            keyHash: hashedProvidedSecret,
            project: {
                publicId: projectId,
            },
        }
    });

    if (!matchingKey) {
        return false;
    }

    // Check if the key is expired or revoked
    const now = new Date();
    if ((matchingKey.expiresAt && matchingKey.expiresAt <= now) || (matchingKey.revokedAt && matchingKey.revokedAt <= now)) {
        return false;
    }

    // Update lastUsedAt timestamp
    await db.ingestKey.update({
        where: { id: matchingKey.id },
        data: { lastUsedAt: now },
    });

    return true;
}

async function hashApiKey(apiKey: string): Promise<string> {
	const encoded = new TextEncoder().encode(apiKey);
	const digest = await crypto.subtle.digest('SHA-256', encoded);

	return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
	let binary = '';

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}