"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section className="counter" aria-labelledby="counter-title">
      <div>
        <h2 id="counter-title">Momentos compartidos</h2>
        <p className="counter-value" aria-live="polite">{count}</p>
      </div>
      <div className="counter-actions">
        <button type="button" aria-label="Disminuir contador" onClick={() => setCount((value) => Math.max(0, value - 1))}>−</button>
        <button type="button" aria-label="Aumentar contador" onClick={() => setCount((value) => value + 1)}>＋</button>
      </div>
    </section>
  );
}
