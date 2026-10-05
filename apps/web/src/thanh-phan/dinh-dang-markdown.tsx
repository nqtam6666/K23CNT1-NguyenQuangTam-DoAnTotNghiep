'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/tien-ich/cn';

interface DinhDangMarkdownProps {
  noiDung: string;
  laNguoiDung?: boolean;
  className?: string;
}

export function DinhDangMarkdown({
  noiDung,
  laNguoiDung = false,
  className,
}: DinhDangMarkdownProps) {
  return (
    <div
      className={cn(
        'text-xs leading-relaxed break-words space-y-2',
        laNguoiDung ? 'text-primary-foreground' : 'text-foreground',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1
              className={cn(
                'text-base font-bold my-2',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2
              className={cn(
                'text-sm font-bold my-2',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3
              className={cn(
                'text-xs font-semibold my-1.5',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4
              className={cn(
                'text-xs font-semibold my-1',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="leading-relaxed mb-2 last:mb-0" {...props} />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong
              className={cn(
                'font-bold',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          b: ({ node: _node, ...props }) => (
            <b
              className={cn(
                'font-bold',
                laNguoiDung ? 'text-inherit' : 'text-foreground'
              )}
              {...props}
            />
          ),
          em: ({ node: _node, ...props }) => (
            <em className="italic opacity-90" {...props} />
          ),
          i: ({ node: _node, ...props }) => (
            <i className="italic opacity-90" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-1 my-1.5 pl-1"
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1 my-1.5 pl-1"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className={cn(
                'border-l-2 pl-3 py-0.5 my-2 italic',
                laNguoiDung
                  ? 'border-white/50 text-white/90'
                  : 'border-primary/50 text-muted-foreground'
              )}
              {...props}
            />
          ),
          a: ({ node: _node, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline underline-offset-2 transition-opacity hover:opacity-80 font-medium',
                laNguoiDung ? 'text-white' : 'text-primary'
              )}
              {...props}
            />
          ),
          hr: ({ node: _node, ...props }) => (
            <hr
              className={cn(
                'my-3 border-t',
                laNguoiDung ? 'border-white/20' : 'border-border'
              )}
              {...props}
            />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-border/80">
              <table className="w-full text-left border-collapse text-xs" {...props} />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead
              className={cn(
                laNguoiDung ? 'bg-white/10' : 'bg-muted/70 text-foreground'
              )}
              {...props}
            />
          ),
          th: ({ node: _node, ...props }) => (
            <th className="border-b border-border/70 px-3 py-1.5 font-semibold text-xs" {...props} />
          ),
          td: ({ node: _node, ...props }) => (
            <td className="border-b border-border/50 px-3 py-1.5 text-xs" {...props} />
          ),
          code: ({ node: _node, className, children, ...props }) => {
            const isBlock = String(children).includes('\n') || /language-(\w+)/.test(className || '');
            if (isBlock) {
              return (
                <KhoiMaNguon className={className}>
                  {String(children).replace(/\n$/, '')}
                </KhoiMaNguon>
              );
            }
            return (
              <code
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[11px]',
                  laNguoiDung
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-muted/80 text-foreground border border-border/50'
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node: _node, children }) => {
            return <>{children}</>;
          },
        }}
      >
        {noiDung}
      </ReactMarkdown>
    </div>
  );
}

function KhoiMaNguon({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const [daChep, setDaChep] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const ngonNgu = match ? match[1] : '';

  const saoChep = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setDaChep(true);
      setTimeout(() => setDaChep(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  return (
    <div className="relative my-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/70 border-b border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
        <span className="uppercase font-semibold tracking-wider">
          {ngonNgu || 'code'}
        </span>
        <button
          type="button"
          onClick={saoChep}
          className="flex items-center gap-1 hover:text-neutral-200 transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800/60"
        >
          {daChep ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}
