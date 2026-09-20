import DOMPurify from "dompurify";

type Props = { html: string | null; className?: string };

export function RichTextViewer({ html, className = "" }: Props) {
  if (!html || html.trim() === "" || html === "<p></p>") return null;
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style", "target", "rel"],
  });
  return (
    <div
      className={`rich-viewer prose prose-base max-w-none rounded-box border border-line bg-base-100 p-6 leading-7 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-ink prose-h1:text-[1.7rem] prose-h1:leading-tight prose-h1:border-b prose-h1:border-line prose-h1:pb-2 prose-h2:text-[1.35rem] prose-h2:leading-snug prose-h2:border-b prose-h2:border-line/50 prose-h2:pb-1.5 prose-h3:text-[1.05rem] prose-h3:uppercase prose-h3:tracking-wide prose-h3:text-muted prose-p:my-3 prose-p:leading-7 prose-a:font-semibold prose-a:text-brand prose-a:underline prose-a:underline-offset-2 prose-a:decoration-2 hover:prose-a:text-[#B30A00] prose-strong:text-ink prose-em:text-ink prose-code:rounded prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1 prose-img:rounded-box prose-img:mx-auto prose-img:shadow-sm prose-blockquote:border-l-[3px] prose-blockquote:border-brand prose-blockquote:bg-brand-tint/40 prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:italic ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
