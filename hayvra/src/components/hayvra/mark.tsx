export function HayvraMark({ className }: { className?: string }) {
  return (
    <img
      src="/media/mark.png"
      alt=""
      width={960}
      height={960}
      decoding="async"
      aria-hidden="true"
      className={className}
    />
  );
}

export function ArchLine() {
  return (
    <svg viewBox="0 0 200 260" fill="none" aria-hidden="true">
      <path
        d="M100 16C68 58 46 98 46 136v100h108V136C154 98 132 58 100 16Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M100 36C76 70 60 104 60 136v78h80v-78C140 104 124 70 100 36Z"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}