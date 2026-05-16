'use client';

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PlayIcon, RotateCcwIcon, TerminalIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

interface CodeEditorProps {
  initialValue: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ initialValue, language, onChange }: CodeEditorProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const editorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  // Get the Monaco language ID from the round language
  const getMonacoLanguage = () => {
    const lang = language.toLowerCase();
    if (lang === 'python' || lang === 'py' || lang === 'python3') return 'python';
    if (lang === 'javascript' || lang === 'js') return 'javascript';
    if (lang === 'cpp' || lang === 'c++') return 'cpp';
    if (lang === 'java') return 'java';
    if (lang === 'c') return 'c';
    return 'python';
  };

  const runCode = async () => {
    if (!editorRef.current) return;

    const currentCode = editorRef.current.getValue();
    if (!currentCode.trim()) {
      setOutput('No code to run. Write some code first.');
      return;
    }

    setIsRunning(true);
    setOutput('⏳ Compiling and running...');

    try {
      const response = await fetch('http://localhost:8000/api/proctoring/execute-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: currentCode,
          language: language.toLowerCase(),
          stdin: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.stdout || 'Code executed successfully (no output).');
      } else if (data.timed_out) {
        setOutput('⏱ Execution timed out (10 second limit). Check for infinite loops.');
      } else {
        // Show stderr but also stdout if any partial output exists
        const combined = [data.stdout, data.stderr].filter(Boolean).join('\n');
        setOutput(combined || 'Execution failed. Please check your code.');
      }
    } catch (error: any) {
      setOutput(`Connection error: Could not reach the execution server.\n${error.message}`);
      toast.error('Could not connect to compiler server.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-sm overflow-hidden bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language} Compiler Ready
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Switch to {theme === 'vs-dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOutput('')}
            className="p-1.5 rounded-sm hover:bg-secondary text-muted-foreground transition-all"
            title="Clear Console"
          >
            <RotateCcwIcon size={14} />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2Icon size={14} className="animate-spin" />
            ) : (
              <PlayIcon size={14} fill="currentColor" />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Editor & Output Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 border-r border-border">
          <Editor
            height="100%"
            language={getMonacoLanguage()}
            defaultValue={initialValue}
            theme={theme}
            onMount={(editor) => { editorRef.current = editor; }}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              roundedSelection: false,
              cursorStyle: 'line',
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Console Output */}
        <div className="w-1/3 bg-slate-950 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
            <TerminalIcon size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Console Output</span>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {output || '// Output will appear here after you click "Run Code"...'}
          </div>
        </div>
      </div>
    </div>
  );
}
