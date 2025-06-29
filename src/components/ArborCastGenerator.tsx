'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArborCastService } from '@/services/arborcastService';
import { Loader2, Upload, PlayCircle } from 'lucide-react';

export function ArborCastGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setAudioUrl(null); // Clear previous audio when new file is selected
    } else {
      setSelectedFile(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document (PDF, DOC, TXT) to generate an ArborCast episode.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const url = await ArborCastService.generateEpisode(selectedFile);
      setAudioUrl(url);
      toast({
        title: "ArborCast Generated!",
        description: "Your AI-powered podcast episode is ready.",
      });
    } catch (error: any) {
      console.error('Error generating ArborCast:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ArborCast episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <PlayCircle className="w-5 h-5" /> AI-Powered ArborCast Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">
          Upload a document (PDF, DOC, TXT) and let our AI generate a podcast episode for you.
        </p>
        <div>
          <Label htmlFor="document-upload" className="text-blue-700">Upload Document</Label>
          <Input 
            id="document-upload" 
            type="file" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="mt-1 file:text-blue-700 file:bg-blue-100 file:border-blue-200 file:hover:bg-blue-200"
          />
          {selectedFile && (
            <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>
          )}
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={!selectedFile || isGenerating}
          className="w-full btn-primary-enhanced bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Generate ArborCast
            </span>
          )}
        </Button>
        {audioUrl && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Listen to your ArborCast:</p>
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
            <a 
              href={audioUrl} 
              download 
              className="text-blue-600 hover:underline text-xs mt-2 block text-right"
            >
              Download Audio
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}