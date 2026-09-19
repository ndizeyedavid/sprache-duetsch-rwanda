import DOMPurify from "dompurify";

type Props = { html: string | null; className?: string };

export function RichTextViewer({ html, className = "" }: Props) {
  if (!html || html.trim() === "" || html === "<p></p>") return null;
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return (
    <div
      className={`prose prose-sm max-w-none rounded-box border border-line bg-base-200/40 p-5 leading-relaxed prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-img:rounded-box prose-img:mx-auto prose-a:text-brand prose-a:underline prose-blockquote:border-l-2 prose-blockquote:border-brand prose-blockquote:pl-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
