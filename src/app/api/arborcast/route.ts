import { NextRequest, NextResponse } from 'next/server';

// Simple TTS simulation - in production this would integrate with Google TTS or ElevenLabs
interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const voice = formData.get('voice') as string || 'default';
    const speed = parseFloat(formData.get('speed') as string) || 1.0;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Extract text from file
    let text = '';
    if (file.type === 'text/plain') {
      text = await file.text();
    } else if (file.type === 'application/pdf') {
      // In production, would use pdf-parse or similar
      text = 'PDF parsing would be implemented here. For demo: This is a sample arboriculture document about tree care and management practices.';
    } else if (file.name.endsWith('.docx')) {
      // In production, would use mammoth or similar
      text = 'DOCX parsing would be implemented here. For demo: This document covers advanced pruning techniques and tree health assessment methods.';
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please use TXT, PDF, or DOCX files.' },
        { status: 400 }
      );
    }

    // Generate podcast script using Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBijgDawU3tvZpi62Dt_BV9glyh_4A0UfQ';
    const MODEL_ID = 'gemini-2.0-flash-preview-05-20';
    
    const prompt = `Convert the following document into an engaging, educational podcast script about arboriculture. Make it conversational and informative. Keep it under 500 words:

${text}

Format the output as a natural-sounding podcast script.`;

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          })
        }
      );

      const geminiData = await geminiResponse.json();
      const podcastScript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate podcast script';
      
      // Calculate duration based on script length
      const scriptWordCount = podcastScript.split(' ').length;
      const estimatedDuration = Math.ceil(scriptWordCount / 150) * 60; // ~150 words per minute
      
      // For now, return the script as the audio URL placeholder
      const response: TTSResponse = {
        success: true,
        audioUrl: `/api/arborcast/audio/${Date.now()}`, // Placeholder for future audio generation
        duration: estimatedDuration,
      };
      
      // Store the script in the response for display
      (response as any).script = podcastScript;
      (response as any).fileName = file.name;

      return NextResponse.json(response);
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate podcast content' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('ArborCast TTS Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's generated podcasts
export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from database
    const mockPodcasts = [
      {
        id: '1',
        title: 'Tree Pruning Best Practices',
        duration: 480, // 8 minutes
        createdAt: '2025-01-20T10:00:00Z',
        audioUrl: '/audio/pruning-guide.mp3',
        originalFile: 'pruning-guide.pdf'
      },
      {
        id: '2', 
        title: 'Soil Health and Tree Nutrition',
        duration: 720, // 12 minutes
        createdAt: '2025-01-18T14:30:00Z',
        audioUrl: '/audio/soil-health.mp3',
        originalFile: 'soil-management.docx'
      }
    ];

    return NextResponse.json({
      success: true,
      podcasts: mockPodcasts
    });

  } catch (error) {
    console.error('ArborCast GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}