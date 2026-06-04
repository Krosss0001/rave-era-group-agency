import { useCallback, useEffect, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  LogOut,
  Search,
  ShieldCheck,
  TicketCheck,
  XCircle,
} from "lucide-react";

type CheckinTicket = {
  ticketCode: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | string;
  eventTitle: string;
  ticketType: string;
  customerName: string;
  issuedAt: string;
  checkedInAt: string | null;
};

type CheckinResult = {
  ticket: CheckinTicket;
  result?: "CHECKED_IN" | "ALREADY_USED";
};

type RecentScan = {
  ticketCode: string;
  status: string;
  result: string;
  at: string;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

const ticketTypeLabels: Record<string, string> = {
  sport: "SPORT",
  business: "BUSINESS",
  online: "ONLINE",
};

export default function AdminCheckinPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-checkin?action=session", { credentials: "include" });
      const data = await response.json() as { authenticated?: boolean };
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  if (authenticated === null) {
    return <Shell><LoadingPanel /></Shell>;
  }

  return (
    <Shell>
      {authenticated ? (
        <CheckinDashboard onLogout={() => setAuthenticated(false)} />
      ) : (
        <LoginPanel onAuthenticated={() => setAuthenticated(true)} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07070b] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex min-h-12 items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">RAVE'ERA STAFF</p>
            <h1 className="mt-1 text-xl font-black uppercase tracking-tight sm:text-2xl">Перевірка квитків</h1>
          </div>
          <ShieldCheck className="h-8 w-8 text-[#00FF88]" aria-hidden="true" />
        </header>
        {children}
      </main>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="grid flex-1 place-items-center">
      <div className="w-full max-w-md animate-pulse border border-white/10 bg-white/[0.03] p-6">
        <div className="h-4 w-32 bg-white/10" />
        <div className="mt-4 h-11 bg-white/10" />
        <div className="mt-3 h-11 bg-white/10" />
      </div>
    </div>
  );
}

function LoginPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin-checkin?action=login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!response.ok) {
        const message = response.status === 429
          ? "Забагато спроб. Спробуйте пізніше."
          : "Невірний PIN або доступ тимчасово недоступний.";
        throw new Error(message);
      }
      setPin("");
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося увійти.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid flex-1 place-items-center">
      <form onSubmit={submit} className="w-full max-w-md border border-white/[0.12] bg-[#101018] p-5 shadow-2xl sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-white/35">Organizer access</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">Перевірка квитків</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">Вхід тільки для організаторів події.</p>
        </div>
        <label className="block text-xs font-bold uppercase tracking-widest text-white/50" htmlFor="checkin-pin">
          PIN
        </label>
        <input
          id="checkin-pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/10 bg-black/40 px-4 text-lg font-semibold tracking-widest text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#00FF88]"
          placeholder="••••••"
        />
        {error ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 bg-[#00FF88] px-5 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          {submitting ? "Перевіряємо..." : "Увійти"}
        </button>
      </form>
    </div>
  );
}

function CheckinDashboard({ onLogout }: { onLogout: () => void }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<RecentScan[]>([]);

  const verify = useCallback(async (value: string) => {
    const payload = value.trim();
    if (!payload) {
      setError("Введіть код квитка або відскануйте QR.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin-checkin?action=verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrPayload: payload }),
      });
      const data = await response.json() as { ticket?: CheckinTicket; error?: string };
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok || !data.ticket) {
        throw new Error(response.status === 404 ? "Квиток не знайдено." : data.error || "Не вдалося перевірити квиток.");
      }
      setResult({ ticket: data.ticket });
      setInput(data.ticket.ticketCode);
      pushRecent(setRecent, data.ticket, "Перевірено");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Не вдалося перевірити квиток.");
    } finally {
      setBusy(false);
    }
  }, [onLogout]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await verify(input);
  }

  async function markUsed() {
    if (!result?.ticket.ticketCode) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin-checkin?action=mark-used", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: result.ticket.ticketCode }),
      });
      const data = await response.json() as { ticket?: CheckinTicket; result?: "CHECKED_IN" | "ALREADY_USED"; error?: string };
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok || !data.ticket) {
        throw new Error(data.error || "Не вдалося підтвердити вхід.");
      }
      setResult({ ticket: data.ticket, result: data.result });
      pushRecent(setRecent, data.ticket, data.result === "ALREADY_USED" ? "Повторний скан" : "Вхід підтверджено");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося підтвердити вхід.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin-checkin?action=logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    onLogout();
  }

  return (
    <div className="grid gap-4 pb-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <ScannerPanel onScan={verify} disabled={busy} />
        <form onSubmit={submit} className="border border-white/[0.1] bg-[#101018] p-4">
          <label htmlFor="ticket-code" className="text-xs font-bold uppercase tracking-widest text-white/45">
            Код квитка
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="ticket-code"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="SBC-2026-ABCDEF123456"
              autoCapitalize="characters"
              className="min-h-12 flex-1 border border-white/10 bg-black/40 px-4 text-base font-semibold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#00FF88]"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-[#00FF88] disabled:cursor-wait disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Перевірити квиток
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </form>
        {result ? <ResultCard result={result} busy={busy} onMarkUsed={markUsed} /> : null}
      </section>

      <aside className="space-y-4">
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 w-full items-center justify-center gap-2 border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:border-red-400/60 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Вийти
        </button>
        <RecentScans scans={recent} />
      </aside>
    </div>
  );
}

function ScannerPanel({ onScan, disabled }: { onScan: (value: string) => void; disabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanRef = useRef("");
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("Камера вимкнена. Ручний ввід доступний завжди.");
  const supported = typeof window !== "undefined" && Boolean(window.BarcodeDetector && navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    if (!enabled || !supported || disabled) {
      return undefined;
    }

    let cancelled = false;
    let frame = 0;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setMessage("Наведіть камеру на QR-код квитка.");
        const Detector = window.BarcodeDetector;
        if (!Detector) {
          setMessage("Браузер не підтримує QR-сканер. Скористайтеся ручним вводом.");
          setEnabled(false);
          return;
        }
        const detector = new Detector({ formats: ["qr_code"] });
        const scan = async () => {
          if (cancelled || !videoRef.current || !canvasRef.current || !detector) {
            return;
          }
          const video = videoRef.current;
          if (video.readyState >= 2 && video.videoWidth > 0) {
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const codes = await detector.detect(canvas).catch(() => []);
            const rawValue = codes[0]?.rawValue?.trim();
            if (rawValue && rawValue !== lastScanRef.current) {
              lastScanRef.current = rawValue;
              onScan(rawValue);
            }
          }
          frame = window.setTimeout(scan, 450);
        };
        void scan();
      } catch {
        setMessage("Камера недоступна. Скористайтеся ручним вводом.");
        setEnabled(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      window.clearTimeout(frame);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [disabled, enabled, onScan, supported]);

  return (
    <section className="border border-white/[0.1] bg-[#101018] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/45">QR сканер</p>
          <p className="mt-1 text-sm text-white/55">{supported ? message : "Браузер не підтримує QR-сканер. Ручний ввід працює."}</p>
        </div>
        <button
          type="button"
          disabled={!supported || disabled}
          onClick={() => setEnabled((value) => !value)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[#00FF88]/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#00FF88] transition-colors hover:bg-[#00FF88] hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {enabled ? "Стоп" : "Камера"}
        </button>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-black">
        {enabled ? (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-white/45">
            QR камера опційна. Введіть код вручну, якщо камера недоступна.
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
}

function ResultCard({ result, busy, onMarkUsed }: { result: CheckinResult; busy: boolean; onMarkUsed: () => void }) {
  const { ticket } = result;
  const isActive = ticket.status === "ACTIVE";
  const isUsed = ticket.status === "USED";
  const statusClass = isActive
    ? "border-[#00FF88]/50 bg-[#00FF88]/10 text-[#00FF88]"
    : isUsed
      ? "border-amber-300/50 bg-amber-300/10 text-amber-200"
      : "border-red-400/50 bg-red-400/10 text-red-200";
  const Icon = isActive ? CheckCircle2 : isUsed ? Clock : XCircle;

  return (
    <article className={`border p-5 ${statusClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.22em] opacity-75">Результат перевірки</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
            {isActive ? "Квиток дійсний" : isUsed ? "Вже використано" : "Недійсний квиток"}
          </h2>
        </div>
        <Icon className="h-10 w-10 shrink-0" aria-hidden="true" />
      </div>
      <dl className="mt-5 grid gap-3 text-sm text-white sm:grid-cols-2">
        <Detail label="Код" value={ticket.ticketCode} />
        <Detail label="Статус" value={ticket.status} />
        <Detail label="Тип" value={ticketTypeLabels[ticket.ticketType] || ticket.ticketType} />
        <Detail label="Учасник" value={ticket.customerName} />
        <Detail label="Подія" value={ticket.eventTitle} />
        <Detail label="Вхід" value={ticket.checkedInAt ? formatDate(ticket.checkedInAt) : "Ще не підтверджено"} />
      </dl>
      <button
        type="button"
        disabled={!isActive || busy}
        onClick={onMarkUsed}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 bg-[#00FF88] px-5 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
      >
        <TicketCheck className="h-5 w-5" aria-hidden="true" />
        Підтвердити вхід
      </button>
      {result.result === "ALREADY_USED" ? <p className="mt-3 text-sm text-amber-100">Повторний скан: цей квиток вже був використаний.</p> : null}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-widest text-white/45">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-white">{value}</dd>
    </div>
  );
}

function RecentScans({ scans }: { scans: RecentScan[] }) {
  return (
    <section className="border border-white/[0.1] bg-[#101018] p-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/45">Останні скани</h2>
      {scans.length === 0 ? (
        <p className="mt-4 text-sm text-white/40">Список з'явиться після першої перевірки.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {scans.map((scan, index) => (
            <li key={`${scan.ticketCode}-${scan.at}-${index}`} className="border border-white/[0.08] bg-black/25 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="break-all text-sm font-bold text-white">{scan.ticketCode}</p>
                <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-white/35">{scan.status}</span>
              </div>
              <p className="mt-1 text-xs text-white/45">{scan.result} · {formatDate(scan.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function pushRecent(setRecent: Dispatch<SetStateAction<RecentScan[]>>, ticket: CheckinTicket, result: string) {
  setRecent((items) => [
    {
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      result,
      at: new Date().toISOString(),
    },
    ...items,
  ].slice(0, 8));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
