import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
export function MaterialPreview({ url, title, pdf }: { url: string; title: string; pdf: boolean }) {
  return <AuthenticatedMedia url={url} title={title} kind={pdf ? 'pdf' : 'video'} className="h-[420px] w-full rounded-box" />;
}
