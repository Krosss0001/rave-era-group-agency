import { useCallback, useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, MapPin, RefreshCw, ShieldCheck, TicketCheck } from "lucide-react";

type PublicTicket = {
  ticketCode: string;
  eventTitle: string;
  ticketType: string;
  customerName: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  issuedAt: string;
};

const ticketTypeLabels: Record<string, string> = {
  sport: "Sport Marketing",
  business: "Business",
  online: "Online",
};

export default function TicketPage() {
  const [, params] = useRoute("/ticket/:ticketCode");
  const ticketCode = params?.ticketCode || "";
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ticket/${encodeURIComponent(ticketCode)}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Квиток не знайдено." : "Перевірка квитка тимчасово недоступна.");
      }
      const data = await response.json() as { ticket: PublicTicket };
      setTicket(data.ticket);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося перевірити квиток.");
    } finally {
      setIsLoading(false);
    }
  }, [ticketCode]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <nav className="border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex min-h-10 items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> До події
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#00FF88]">Ticket verification</span>
        </div>
      </nav>

      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
        {isLoading ? <div className="h-80 w-full animate-pulse border border-white/10 bg-white/[0.03]" aria-label="Перевірка квитка" /> : null}
        {!isLoading && error ? (
          <div className="space-y-5 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-300" aria-hidden="true" />
            <h1 className="text-3xl font-black uppercase tracking-tight">Квиток не підтверджено</h1>
            <p className="text-sm text-white/65">{error}</p>
            <button type="button" onClick={loadTicket} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:border-[#00FF88]/60 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Перевірити ще раз
            </button>
          </div>
        ) : null}
        {!isLoading && ticket ? <VerifiedTicket ticket={ticket} /> : null}
      </main>
    </div>
  );
}

function VerifiedTicket({ ticket }: { ticket: PublicTicket }) {
  const isActive = ticket.status === "ACTIVE";
  return (
    <article className="w-full border border-white/15 bg-[#101018] p-6 shadow-2xl sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00FF88]">Rave'Era Tickets</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">{ticket.eventTitle}</h1>
        </div>
        {isActive ? <CheckCircle2 className="h-12 w-12 shrink-0 text-[#00FF88]" aria-label="Квиток активний" /> : <AlertCircle className="h-12 w-12 shrink-0 text-amber-300" aria-label={`Статус квитка: ${ticket.status}`} />}
      </div>

      <div className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
        <Detail icon={<ShieldCheck />} label="Статус" value={ticket.status} accent={isActive} />
        <Detail icon={<TicketCheck />} label="Код квитка" value={ticket.ticketCode} />
        <Detail icon={<CalendarDays />} label="Дата і час" value="27 травня 2026, 09:30-23:00" />
        <Detail icon={<MapPin />} label="Локація" value="КВЦ «Парковий», Київ" />
        <Detail icon={<TicketCheck />} label="Тип квитка" value={ticketTypeLabels[ticket.ticketType] || ticket.ticketType} />
        <Detail icon={<ShieldCheck />} label="Власник" value={ticket.customerName} />
      </div>

      <p className="mt-8 border-t border-dashed border-white/20 pt-5 text-xs leading-relaxed text-white/60">
        Квиток дійсний лише після успішної оплати та може бути перевірений організатором.
      </p>
    </article>
  );
}

function Detail({ icon, label, value, accent = false }: { icon: React.ReactElement; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[#00FF88]">{icon}</span>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-white/50">{label}</p>
        <p className={`mt-1 font-semibold ${accent ? "text-[#00FF88]" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}
