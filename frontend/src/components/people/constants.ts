export const TABS = ["All", "Students", "Teachers", "Groups"] as const;
export type PeopleTab = (typeof TABS)[number];
