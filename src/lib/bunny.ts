// src/lib/bunny.ts — SERVER SIDE ONLY
const BUNNY_HOST = process.env.BUNNY_STORAGE_HOST!;
const BUNNY_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_KEY = process.env.BUNNY_STORAGE_API_KEY!;
export const BUNNY_CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL!;

export async function uploadToBunny(buffer: Buffer, fileName: string): Promise<string> {
  const url = `https://${BUNNY_HOST}/${BUNNY_ZONE}/${fileName}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) throw new Error(`Bunny upload failed: ${res.status} ${await res.text()}`);
  return `${BUNNY_CDN_URL}/${fileName}`;
}

export async function deleteFromBunny(fileName: string): Promise<void> {
  const url = `https://${BUNNY_HOST}/${BUNNY_ZONE}/${fileName}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { AccessKey: BUNNY_KEY },
  });
}

export function extractBunnyPath(cdnUrl: string): string {
  return cdnUrl.replace(`${BUNNY_CDN_URL}/`, '');
}
