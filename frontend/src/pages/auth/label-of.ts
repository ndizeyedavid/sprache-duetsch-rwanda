import type { ReferenceItem } from './reference-item';
export function labelOf(item: ReferenceItem): string {
 return item.name ?? item.title ?? item.code;
}
