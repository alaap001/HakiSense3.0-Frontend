import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

/**
 * Styled react-markdown wrapper. We style via the `components` map (rather than a
 * typography plugin) so markdown matches the violet/dark design system. GFM
 * (tables, strikethrough, task lists, autolinks) is enabled with remark-gfm.
 * Per react-markdown guidance we wrap in a <div> instead of passing `className`.
 */
const components: Components = {
  h1: ({ node, ...p }) => (
    <h1 className="mb-3 mt-6 font-display text-xl font-semibold text-text-primary" {...p} />
  ),
  h2: ({ node, ...p }) => (
    <h2 className="mb-2 mt-6 font-display text-lg font-semibold text-text-primary" {...p} />
  ),
  h3: ({ node, ...p }) => (
    <h3 className="mb-2 mt-4 font-display text-base font-semibold text-text-primary" {...p} />
  ),
  p: ({ node, ...p }) => (
    <p className="my-3 text-sm leading-relaxed text-text-secondary" {...p} />
  ),
  ul: ({ node, ...p }) => (
    <ul className="my-3 list-disc space-y-1 pl-5 text-sm text-text-secondary" {...p} />
  ),
  ol: ({ node, ...p }) => (
    <ol className="my-3 list-decimal space-y-1 pl-5 text-sm text-text-secondary" {...p} />
  ),
  li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
  a: ({ node, ...p }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand underline underline-offset-2 hover:text-brand"
      {...p}
    />
  ),
  strong: ({ node, ...p }) => <strong className="font-semibold text-text-primary" {...p} />,
  em: ({ node, ...p }) => <em className="italic" {...p} />,
  blockquote: ({ node, ...p }) => (
    <blockquote
      className="my-3 border-l-2 border-violet/40 pl-4 text-sm italic text-text-secondary/80"
      {...p}
    />
  ),
  hr: ({ node, ...p }) => <hr className="my-6 border-hairline" {...p} />,
  code: ({ node, ...p }) => (
    <code className="rounded bg-surface-strong px-1.5 py-0.5 font-mono text-[0.85em] text-brand" {...p} />
  ),
  pre: ({ node, ...p }) => (
    <pre
      className="custom-scrollbar my-3 overflow-auto rounded-lg bg-panel p-3 font-mono text-xs text-text-secondary/90"
      {...p}
    />
  ),
  table: ({ node, ...p }) => (
    <div className="custom-scrollbar my-4 overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full border-collapse text-left text-xs" {...p} />
    </div>
  ),
  thead: ({ node, ...p }) => <thead className="bg-surface" {...p} />,
  th: ({ node, ...p }) => (
    <th className="border-b border-hairline px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-text-secondary" {...p} />
  ),
  td: ({ node, ...p }) => (
    <td className="border-b border-hairline px-3 py-2 align-top text-text-secondary/90" {...p} />
  ),
  tr: ({ node, ...p }) => <tr className="transition-colors hover:bg-surface" {...p} />,
}

export function MarkdownView({ children }: { children: string }) {
  return (
    <div className="text-sm">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </div>
  )
}
