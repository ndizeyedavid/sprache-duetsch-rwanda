export const CONTENT_TYPES = ["TEXT", "VIDEO", "AUDIO", "PDF", "MIXED"] as const;
export const MATERIAL_TYPES = [
  "NOTE",
  "PDF",
  "VIDEO",
  "AUDIO",
  "LINK",
  "WORKSHEET",
  "SLIDE",
  "OTHER",
] as const;
export const ACTIVITY_TYPES = [
  { value: "FILL_BLANK", label: "Fill in the blank" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "WRITING", label: "Writing" },
  { value: "MCQ", label: "Multiple choice" },
  { value: "DOCUMENT", label: "Document submission" },
] as const;
