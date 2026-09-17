export const TABS = ['Chats', 'Notices'] as const;
export type Tab = (typeof TABS)[number];
