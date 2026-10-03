import { Coffee, Headphones, Milk, NotebookPen, Package, Sandwich, ShoppingBag } from "lucide-react";

// Illustration and tint for each product tile.
const ART = {
  chai: { Icon: Coffee, tint: "#f4e8dc", ink: "#7a4a24" },
  samosa: { Icon: Sandwich, tint: "#fbefd5", ink: "#9a6412" },
  notebook: { Icon: NotebookPen, tint: "#e3ecfb", ink: "#2b55a8" },
  bottle: { Icon: Milk, tint: "#e0f2f7", ink: "#1b6b80" },
  tote: { Icon: ShoppingBag, tint: "#e6eee4", ink: "#3f6b35" },
  earphones: { Icon: Headphones, tint: "#ece6f7", ink: "#5b3fa0" },
};

export function artFor(id) {
  return ART[id] ?? { Icon: Package, tint: "#eef0f3", ink: "#475467" };
}
