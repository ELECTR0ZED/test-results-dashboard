export function generateApiKey(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);

	const secret = base64UrlEncode(bytes);

	return `trd_${secret}`;
}

export async function hashApiKey(apiKey: string): Promise<string> {
	const encoded = new TextEncoder().encode(apiKey);
	const digest = await crypto.subtle.digest('SHA-256', encoded);

	return base64UrlEncode(new Uint8Array(digest));
}

export async function verifyApiKey(apiKey: string, expectedHash: string): Promise<boolean> {
    const hash = await hashApiKey(apiKey);

    return hash === expectedHash;
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