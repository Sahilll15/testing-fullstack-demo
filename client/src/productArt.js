import { Coffee, CupSoda, Donut, NotebookPen, ShoppingBag, Sprout, Package } from "lucide-react";

// Illustration and tint for each product tile.
const ART = {
  coffee: { Icon: Coffee, tint: "#f4e8dc", ink: "#7a4a24" },
  bagel: { Icon: Donut, tint: "#fbefd5", ink: "#9a6412" },
  notebook: { Icon: NotebookPen, tint: "#e3ecfb", ink: "#2b55a8" },
  mug: { Icon: CupSoda, tint: "#f6e1e4", ink: "#a23b4c" },
  tote: { Icon: ShoppingBag, tint: "#e6eee4", ink: "#3f6b35" },
  plant: { Icon: Sprout, tint: "#dff3ea", ink: "#1f7a4d" },
};

export function artFor(id) {
  return ART[id] ?? { Icon: Package, tint: "#eef0f3", ink: "#475467" };
}
