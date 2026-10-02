import { useState } from "react";

export function DiscountForm({ onApply }) {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(code);
      }}
    >
      <label htmlFor="code">Discount code</label>
      <input id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
      <button type="submit" disabled={!code.trim()}>
        Apply
      </button>
    </form>
  );
}
