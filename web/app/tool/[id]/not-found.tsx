import Link from 'next/link';

export default function ToolNotFound() {
  return (
    <div className="max-w-xl mx-auto px-8 py-32 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted mb-5">404 · tool not found</div>
      <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl mb-4 leading-[1.02]">
        Doesn&apos;t <span className="text-lime italic">exist.</span>
      </h1>
      <p className="text-bone-dim leading-relaxed mb-10">
        This tool isn&apos;t in the registry. It may have been unlisted, never existed, or the URL is wrong.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-lime text-lime-ink font-semibold text-sm px-6 py-3 rounded-full hover:shadow-[0_20px_50px_-15px_rgba(212,255,58,0.6)] transition-shadow"
      >
        <span>←</span> Back to marketplace
      </Link>
    </div>
  );
}
