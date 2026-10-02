import { useState } from "react";
import { Tag } from "lucide-react";

export function DiscountForm({ onApply, applied }) {
  const [code, setCode] = useState("");

  return (
    <form
      className="discount"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(code);
      }}
    >
      <label htmlFor="code">Discount code</label>
      <div className="discount-row">
        <span className="input-icon">
          <Tag size={16} aria-hidden="true" />
          <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SAVE10" autoComplete="off" />
        </span>
        <button className="btn btn-secondary" type="submit" disabled={!code.trim()}>
          Apply
        </button>
      </div>
      {applied && <p className="applied">Code {applied} applied</p>}
    </form>
  );
}
