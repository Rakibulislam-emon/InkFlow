export const CONFUSION_GROUPS = [
  { id: "s-f", name: "S vs F", chars: ["s", "f"] },
  { id: "r-n", name: "R vs N", chars: ["r", "n"] },
  { id: "b-f", name: "B vs F", chars: ["b", "f"] },
  { id: "k-R", name: "k vs R", chars: ["k", "R"] },
  { id: "a-o", name: "A vs O", chars: ["a", "o"] },
  { id: "u-v", name: "U vs V", chars: ["u", "v"] },
  { id: "m-n", name: "M vs N", chars: ["m", "n"] },
  { id: "i-j", name: "I vs J", chars: ["i", "j"] },
  { id: "h-k", name: "H vs K", chars: ["h", "k"] },
];

export function getConfusionGroupForChar(char: string) {
  return CONFUSION_GROUPS.find(
    (group) =>
      group.chars.includes(char.toLowerCase()) || group.chars.includes(char),
  );
}

export function getSimilarChars(char: string) {
  const group = getConfusionGroupForChar(char);
  if (!group) return [];
  return group.chars.filter((c) => c !== char);
}
