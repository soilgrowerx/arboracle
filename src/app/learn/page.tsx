'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ArborCastGenerator } from '@/components/ArborCastGenerator';

export default function LearnPage() {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch('/knowledge/introduction.md');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (e: any) {
        console.error('Error fetching markdown:', e);
        setError(`Failed to load content: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-green-700 flex items-center gap-2">
          <span className="animate-spin">📚</span> Loading knowledge base...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 text-red-800">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-green-800 mt-4 flex items-center gap-2">
          <BookOpen size={28} /> Arboracle Knowledge Base
        </h1>
        <p className="text-green-600">Your comprehensive guide to arboriculture.</p>
      </header>

      <Card className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-green-200 markdown-body">
        <CardContent className="p-5 sm:p-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}: React.HTMLAttributes<HTMLElement> & { inline?: boolean; node?: any; }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                  >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {markdown}
          </ReactMarkdown>
        </CardContent>
      </Card>

      <div className="mt-8">
        <ArborCastGenerator />
      </div>
    </div>
  );
}