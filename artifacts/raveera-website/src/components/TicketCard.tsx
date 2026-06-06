import { CalendarDays, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export type IssuedTicket = {
  ticketCode: string;
  eventTitle: string;
  eventSlug: string;
  eventDateTime: string;
  eventVenue: string;
  eventHref: string;
  ticketType: string;
  customerName: string;
  status: string;
  qrPayload: string;
  issuedAt: string;
};

const ticketTypeLabels: Record<string, string> = {
  sport: "Sport Marketing",
  business: "Business",
  online: "Online",
  standard: "STANDARD",
  vip: "VIP + AFTERPARTY",
};

export function TicketCard({ ticket }: { ticket: IssuedTicket }) {
  return (
    <article className="mx-auto w-full max-w-4xl overflow-hidden border border-white/15 bg-[#101018] shadow-2xl print:border-black print:bg-white print:text-black print:shadow-none">
      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="space-y-8 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00FF88] print:text-black">Rave'Era Tickets</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">{ticket.eventTitle}</h2>
            </div>
            <ShieldCheck className="h-8 w-8 shrink-0 text-[#00FF88] print:text-black" aria-hidden="true" />
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <TicketDetail icon={<CalendarDays />} label="Дата і час" value={ticket.eventDateTime} />
            <TicketDetail icon={<MapPin />} label="Локація" value={ticket.eventVenue} />
            <TicketDetail icon={<UserRound />} label="Власник квитка" value={ticket.customerName} />
            <TicketDetail icon={<ShieldCheck />} label="Тип квитка" value={ticketTypeLabels[ticket.ticketType] || ticket.ticketType} />
          </div>

          <div className="border-t border-dashed border-white/20 pt-5 print:border-black/30">
            <p className="text-xs font-mono uppercase tracking-widest text-white/55 print:text-black/60">Код квитка</p>
            <p className="mt-2 font-mono text-xl font-bold tracking-widest text-[#00FF88] print:text-black">{ticket.ticketCode}</p>
          </div>

          <p className="text-xs leading-relaxed text-white/60 print:text-black/70">
            Квиток дійсний лише після успішної оплати та може бути перевірений організатором.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t border-dashed border-white/20 bg-white p-6 text-center text-black md:border-l md:border-t-0 print:border-black/30">
          <QRCodeSVG value={ticket.qrPayload} size={196} level="M" marginSize={2} title={`QR-код квитка ${ticket.ticketCode}`} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Scan to verify</p>
            <p className="mt-1 text-xs text-black/60">Покажіть QR-код на вході</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function TicketDetail({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[#00FF88] print:text-black">{icon}</span>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-white/50 print:text-black/60">{label}</p>
        <p className="mt-1 font-semibold text-white print:text-black">{value}</p>
      </div>
    </div>
  );
}
