import { useEffect } from 'react';

function Lightbox({ src, alt, onClose, onNext, onPrev, currentIndex, total }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext?.();
      if (e.key === 'ArrowLeft') onPrev?.();
    }
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onNext, onPrev]);

  const showNav = typeof currentIndex === 'number' && typeof total === 'number' && total > 1;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      {showNav && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          aria-label="Previous image"
        >
          ❮
        </button>
      )}

      <img
        src={src}
        alt={alt}
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />

      {showNav && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          aria-label="Next image"
        >
          ❯
        </button>
      )}

      {showNav && (
        <div className="lightbox-counter">
          {currentIndex + 1} / {total}
        </div>
      )}
    </div>
  );
}

export default Lightbox;
