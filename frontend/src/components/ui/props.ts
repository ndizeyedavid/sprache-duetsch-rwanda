export type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string | null;
};
