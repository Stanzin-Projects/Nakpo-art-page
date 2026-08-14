import { Star } from 'lucide-react';

export function StarRating({ value = 0, onChange, size = 'h-4 w-4' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange && onChange(s)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
        >
          <Star
            className={`${size} ${
              s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
