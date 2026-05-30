import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Clock3, Mail, Printer, RefreshCw, Ticket } from "lucide-react";
import { TicketCard, type IssuedTicket } from "../components/TicketCard";

type PaymentStatusResponse = {
  ok: true;
  order: {
    id: number;
    merchantRequestId: string;
    status: string;
    ticketType: string;
    amount: number;
    currency: string;
  };
  ticket: IssuedTicket | null;
};

export default function PaymentSuccessPage() {
  const merchantRequestId = new URLSearchParams(window.location.search).get("merchantRequestId") || "";
  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    if (!merchantRequestId) {
      setError("Не вдалося визначити номер замовлення. Зверніться до організатора.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/payment/status?merchantRequestId=${encodeURIComponent(merchantRequestId)}`);
      if (!response.ok) {
        throw new Error("Статус замовлення тимчасово недоступний.");
      }
      setData(await response.json() as PaymentStatusResponse);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося отримати статус платежу.");
    } finally {
      setIsLoading(false);
    }
  }, [merchantRequestId]);

  useEffect(() => {
    void loadStatus();
    const intervalId = window.setInterval(() => void loadStatus(), 4000);
    const timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 120000);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [loadStatus]);

  useEffect(() => {
    if (data?.ticket) {
      document.title = `${data.ticket.ticketCode} | SBC Summit Ukraine 2026`;
    }
  }, [data?.ticket]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <nav className="border-b border-white/[0.08] bg-black/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex min-h-10 items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            До події
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#00FF88]">Rave'Era Tickets</span>
        </div>
      </nav>

      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 md:px-12">
        {isLoading && !data ? <LoadingState /> : null}
        {error && !data ? <ErrorState message={error} onRetry={loadStatus} /> : null}
        {data && !data.ticket ? <PendingState status={data.order.status} onRetry={loadStatus} /> : null}
        {data?.ticket ? (
          <div className="w-full space-y-6">
            <div className="space-y-2 text-center print:hidden">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00FF88]">Оплата підтверджена</p>
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Ваш квиток готовий</h1>
              <p className="text-sm text-white/65">Квиток також буде надіслано на email, вказаний під час замовлення.</p>
            </div>
            <TicketCard ticket={data.ticket} />
            <div className="flex flex-col justify-center gap-3 sm:flex-row print:hidden">
              <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#00FF88]/50 bg-[#00FF88] px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Завантажити / Друкувати
              </button>
              <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-[#00FF88]/60 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Назад до події
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full max-w-xl animate-pulse space-y-4" aria-label="Завантаження квитка">
      <div className="mx-auto h-4 w-40 bg-white/10" />
      <div className="mx-auto h-10 w-72 bg-white/10" />
      <div className="h-80 border border-white/10 bg-white/[0.03]" />
    </div>
  );
}

function PendingState({ status, onRetry }: { status: string; onRetry: () => void }) {
  return (
    <div className="max-w-lg space-y-5 text-center">
      <Clock3 className="mx-auto h-12 w-12 text-[#00FF88]" aria-hidden="true" />
      <h1 className="text-3xl font-black uppercase tracking-tight">Платіж обробляється</h1>
      <p className="text-sm leading-relaxed text-white/65">
        Ми очікуємо підтвердження від AlliancePay. Квиток з'явиться тут автоматично після перевіреного статусу SUCCESS.
      </p>
      <p className="text-xs font-mono uppercase tracking-widest text-white/45">Поточний статус: {status}</p>
      <button type="button" onClick={onRetry} className="mx-auto inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-[#00FF88]/60 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Перевірити ще раз
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-lg space-y-5 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-amber-300" aria-hidden="true" />
      <h1 className="text-3xl font-black uppercase tracking-tight">Не вдалося завантажити квиток</h1>
      <p className="text-sm leading-relaxed text-white/65">{message}</p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#00FF88]/50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Спробувати ще раз
        </button>
        <a href="mailto:ceo@rave-era.com.ua" className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
          <Mail className="h-4 w-4" aria-hidden="true" /> Підтримка
        </a>
      </div>
    </div>
  );
}
