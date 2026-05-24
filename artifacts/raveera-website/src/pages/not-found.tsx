import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

const G = "#00FF88";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0F] text-white px-4">
      <div className="w-full max-w-md border border-white/[0.08] bg-white/[0.02] p-6 text-center">
        <AlertCircle className="h-9 w-9 mx-auto mb-4 text-red-400" />
        <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Page not found</h1>
        <p className="text-sm text-white/45 leading-relaxed mb-6">
          The requested page does not exist. Use the event page or contacts page to continue.
        </p>
        <Link
          href="/event/sbc-summit-ukraine-2026"
          className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]"
          style={{ background: G }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to event
        </Link>
      </div>
    </div>
  );
}
