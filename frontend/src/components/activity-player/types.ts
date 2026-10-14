export type ActivityConfig = Record<string, unknown>;

/** A response that points at an uploaded recording or document. */
export type FileResponse = { fileUrl: string; mimeType?: string; text?: string; durationSeconds?: number };

/** Feedback the API reveals only after a submission (answer keys + per-part results). */
export type ActivityReview = {
  results: boolean[] | null;
  correctIndex?: number | null;
  correctIndices?: (number | null)[] | null;
  correct?: boolean | null;
  blanks?: string[][] | null;
  pairs?: { left: string; right: string }[];
  order?: string[] | null;
  transcript?: string;
  modelAnswer?: string;
  explanation?: string;
};

export type PlayerProps = {
  activityId: string;
  type: string;
  config: ActivityConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
};
