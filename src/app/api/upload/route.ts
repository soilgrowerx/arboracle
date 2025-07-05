import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const treeId = formData.get('treeId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!treeId) {
      return NextResponse.json({ error: 'Tree ID is required' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', treeId);
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(file.name);
        const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const filepath = path.join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        
        // Return relative URL
        const url = `/uploads/${treeId}/${filename}`;
        uploadedUrls.push(url);
      }
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' }, 
      { status: 500 }
    );
  }
}