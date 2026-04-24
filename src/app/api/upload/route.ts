import { NextRequest, NextResponse } from 'next/server';
import { uploadToBunny, deleteFromBunny } from '@/lib/bunny';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${nanoid()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToBunny(buffer, fileName);

    return NextResponse.json({ success: true, url, fileName });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { fileName } = await req.json();
    if (!fileName) return NextResponse.json({ error: 'No fileName' }, { status: 400 });
    await deleteFromBunny(fileName);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
