function modulesFrom(code: string) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 33 + code.charCodeAt(i)) >>> 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (finder) {
        const dx = x < 7 ? x : x >= size - 7 ? x - (size - 7) : x;
        const dy = y < 7 ? y : y >= size - 7 ? y - (size - 7) : y;
        const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        cells.push(edge || core);
      } else {
        const bit = (h >> ((x * 3 + y) % 16)) & 1;
        cells.push(Boolean(bit) || ((x + y + h) % 5 === 0));
      }
    }
  }
  return { size, cells };
}

export function CouponQR({ code }: { code: string }) {
  const { size, cells } = modulesFrom(code);
  return (
    <div className="mx-auto w-52 rounded-xl bg-fg p-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full text-bg" aria-hidden="true">
        {cells.map((on, i) =>
          on ? (
            <rect
              key={i}
              x={i % size}
              y={Math.floor(i / size)}
              width="1"
              height="1"
              fill="currentColor"
            />
          ) : null,
        )}
      </svg>
    </div>
  );
}
