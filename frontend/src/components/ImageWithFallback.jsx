import { useState } from 'react';

const FALLBACK_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjY2JjZWR0IiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNCIvPjwvc3ZnPg==';

export function ImageWithFallback({ src, alt, className, ...rest }) {
  const [didError, setDidError] = useState(false);
  if (didError) {
    return (
      <div className={`inline-flex items-center justify-center bg-muted text-muted-foreground ${className || ''}`} {...rest}>
        <img src={FALLBACK_SRC} alt={alt || 'Image'} className="max-w-full max-h-full object-contain opacity-50" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setDidError(true)}
      {...rest}
    />
  );
}
