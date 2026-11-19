// Listening scripts in test packs: plain German read by one voice, or a conversation written as
// "M: …" / "F: …" lines (a man and a woman, like the Goethe recordings). A line without a label
// continues the turn above it.
export type Speaker = "m" | "f";
export type Turn = { speaker: Speaker; text: string };

const TURN = /^([MF]):\s*(.*)$/;
/** Labels writers reach for instead of M:/F: — rejected so a voice is never read out as "Frau". */
const OTHER_LABEL = /^(Mann|Frau|Moderator(in)?|Sprecher(in)?|Ansage|[A-Z]):\s/;

export function parseScript(script: string): Turn[] {
  const turns: Turn[] = [];
  for (const line of script.split("\n").map((value) => value.trim()).filter(Boolean)) {
    const match = TURN.exec(line);
    const last = turns.at(-1);
    if (match) turns.push({ speaker: match[1] === "F" ? "f" : "m", text: match[2] ?? "" });
    else if (last) last.text = `${last.text} ${line}`;
    else turns.push({ speaker: "m", text: line });
  }
  return turns.filter((turn) => turn.text.trim());
}

export function scriptProblems(script: string): string[] {
  const lines = script.split("\n").map((value) => value.trim()).filter(Boolean);
  const problems: string[] = [];
  if (lines.some((line) => TURN.test(line)) && !TURN.test(lines[0] ?? "")) problems.push("a conversation must start with an M: or F: line");
  const other = lines.find((line) => OTHER_LABEL.test(line) && !TURN.test(line));
  if (other) problems.push(`speaker labels are "M:" and "F:" (found "${other.slice(0, 20)}")`);
  if (lines.some((line) => TURN.test(line) && !TURN.exec(line)?.[2]?.trim())) problems.push("empty M:/F: line");
  return problems;
}
