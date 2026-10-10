export type MiniCalendarProps = {
 month?: Date;
 /** Day-of-month numbers that get a marker dot. */
 marked?: number[];
 selected?: number;
 onSelect?: (day: number) => void;
 className?: string;
};
