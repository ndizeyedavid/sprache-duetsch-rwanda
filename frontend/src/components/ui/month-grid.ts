import {
eachDayOfInterval,
endOfMonth,
endOfWeek,
startOfMonth,
startOfWeek
} from "date-fns";
export function monthGrid(month: Date): Date[] {
 return eachDayOfInterval({
 start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
 end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
 });
}
