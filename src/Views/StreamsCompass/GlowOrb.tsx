interface GlowOrbProps {
  color: string;
}

function GlowOrb({ color }: GlowOrbProps) {
  return (
    <div
      className="w-16 h-16 rounded-full opacity-80 transition-all duration-200 ease-in-out"
      style={{
        background: `radial-gradient(circle,
          color-mix(in srgb, ${color} 100%, transparent 0%) 0%,
          color-mix(in srgb, ${color} 80%, transparent 20%) 20%,
          color-mix(in srgb, ${color} 50%, transparent 50%) 50%,
          color-mix(in srgb, ${color} 30%, transparent 70%) 70%,
          transparent 100%
        )`,
        filter: 'blur(12px)',
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    />
  );
}

export default GlowOrb;
