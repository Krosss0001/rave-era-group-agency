import { useCallback, useEffect, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import type { CameraDevice, Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  ImageUp,
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

type QrFileScanner = Html5Qrcode & {
  scanFile: (imageFile: File, showImage?: boolean) => Promise<string>;
};

const ticketTypeLabels: Record<string, string> = {
  sport: "SPORT",
  business: "BUSINESS",
  online: "ONLINE",
};

const ticketCodePattern = /SBC-2026-[A-Z0-9-]+/i;

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
    const ticketCode = extractTicketCodeFromScan(value);
    if (!ticketCode) {
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
        body: JSON.stringify({ ticketCode }),
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
  const scannerIdRef = useRef(`checkin-qr-reader-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const startingRef = useRef(false);
  const scanHandledRef = useRef(false);
  const mountedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "stopping">("idle");
  const [message, setMessage] = useState("Натисніть «Увімкнути камеру», щоб сканувати QR.");
  const [error, setError] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const canUseCamera = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
  const isRunning = status === "starting" || status === "scanning" || status === "stopping";

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      if (mountedRef.current) {
        setStatus("idle");
      }
      return;
    }

    if (mountedRef.current) {
      setStatus("stopping");
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // The browser may already have stopped the stream after permission changes.
    } finally {
      scannerRef.current = null;
      startingRef.current = false;
      scanHandledRef.current = false;
      if (mountedRef.current) {
        setStatus("idle");
        setMessage("Сканер зупинено. Ручний ввід доступний завжди.");
        setDiagnostic("");
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (startingRef.current || scannerRef.current?.isScanning) {
      return;
    }

    startingRef.current = true;

    if (typeof window !== "undefined" && !window.isSecureContext) {
      startingRef.current = false;
      setError(getCameraErrorMessage(new Error("Insecure context")));
      setDiagnostic("Перевірка: сторінка відкрита не в захищеному контексті.");
      return;
    }

    if (!canUseCamera) {
      startingRef.current = false;
      setError("Браузер не надає доступ до камери. Скористайтеся ручним вводом.");
      setDiagnostic("Перевірка: navigator.mediaDevices.getUserMedia недоступний.");
      return;
    }

    setStatus("starting");
    setError("");
    setDiagnostic("Перевірка: запитуємо дозвіл камери Safari.");
    setMessage("Запитуємо доступ до камери...");
    scanHandledRef.current = false;

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      permissionStream.getTracks().forEach((track) => track.stop());

      await waitForScannerContainer(scannerIdRef.current);

      const { Html5Qrcode: Html5QrcodeScanner, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      const scanner = new Html5QrcodeScanner(scannerIdRef.current, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      scannerRef.current = scanner;

      const scanConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const size = Math.min(280, Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.75));
          return { width: Math.max(140, size), height: Math.max(140, size) };
        },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      const handleSuccess = (decodedText: string) => {
        if (scanHandledRef.current) {
          return;
        }
        const ticketCode = extractTicketCodeFromScan(decodedText);
        if (!ticketCode) {
          setError("QR зчитано, але код квитка не знайдено");
          setDiagnostic(`Зчитаний QR: ${formatDecodedPreview(decodedText)}`);
          return;
        }
        scanHandledRef.current = true;
        setMessage("QR зчитано. Перевіряємо квиток...");
        void stopScanner().finally(() => onScan(ticketCode));
      };

      type ScannerCameraInput = Parameters<Html5Qrcode["start"]>[0];
      const exactEnvironmentCamera = { facingMode: { exact: "environment" } } as unknown as ScannerCameraInput;
      const environmentCamera = { facingMode: "environment" } as unknown as ScannerCameraInput;

      try {
        await scanner.start(
          exactEnvironmentCamera,
          scanConfig,
          handleSuccess,
          () => undefined,
        );
        setDiagnostic("Камера: задня камера через exact environment.");
      } catch (firstError) {
        try {
          setDiagnostic("Камера: fallback через facingMode environment.");
          await resetScanner(scanner);
          await scanner.start(environmentCamera, scanConfig, handleSuccess, () => undefined);
        } catch {
          try {
            setDiagnostic("Камера: fallback через стандартний доступ { video: true }.");
            await resetScanner(scanner);
            await scanner.start(
              environmentCamera,
              { ...scanConfig, videoConstraints: {} } as unknown as Html5QrcodeCameraScanConfig,
              handleSuccess,
              () => undefined,
            );
          } catch {
            setDiagnostic("Камера: fallback через список камер пристрою.");
            await resetScanner(scanner);
            const cameras = await Html5QrcodeScanner.getCameras();
            const cameraIds = selectCameraIds(cameras);
            if (cameraIds.length === 0) {
              throw firstError;
            }
            await startWithCameraIds(scanner, cameraIds, scanConfig, handleSuccess);
          }
        }
      }

      if (mountedRef.current) {
        setStatus("scanning");
        setMessage("Наведіть камеру на QR-код квитка.");
      }
    } catch (err) {
      const scanner = scannerRef.current;
      if (scanner) {
        await resetScanner(scanner);
      }
      scannerRef.current = null;
      if (mountedRef.current) {
        setStatus("idle");
        setError(getCameraErrorMessage(err));
        setMessage("Сканер не запущено. Ручний ввід доступний.");
      }
    } finally {
      startingRef.current = false;
    }
  }, [canUseCamera, onScan, stopScanner]);

  const scanPhoto = useCallback(async (file: File) => {
    if (photoBusy || startingRef.current || disabled) {
      return;
    }
    setPhotoBusy(true);
    setError("");
    setDiagnostic("Тест з фото: декодуємо QR із зображення.");
    let scanner: QrFileScanner | null = null;
    try {
      await waitForScannerContainer(scannerIdRef.current);
      const { Html5Qrcode: Html5QrcodeScanner, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      scanner = new Html5QrcodeScanner(scannerIdRef.current, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      }) as QrFileScanner;
      const decodedText = await scanner.scanFile(file, false);
      const ticketCode = extractTicketCodeFromScan(decodedText);
      if (!ticketCode) {
        setError("QR зчитано, але код квитка не знайдено");
        setDiagnostic(`Зчитаний QR: ${formatDecodedPreview(decodedText)}`);
        return;
      }
      setMessage("QR з фото зчитано. Перевіряємо квиток...");
      onScan(ticketCode);
    } catch {
      setError("Не вдалося зчитати QR з фото. Спробуйте інше фото або введіть код вручну.");
    } finally {
      if (scanner) {
        await resetScanner(scanner);
      }
      setPhotoBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [disabled, onScan, photoBusy]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner?.isScanning) {
        void scanner.stop().catch(() => undefined);
      }
      startingRef.current = false;
    };
  }, []);

  return (
    <section className="border border-white/[0.1] bg-[#101018] p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-white/45">QR сканер</p>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{message}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-52">
          {isRunning ? (
            <button
              type="button"
              disabled={status === "stopping"}
              onClick={() => void stopScanner()}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-red-400/50 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-200 transition-colors hover:bg-red-400 hover:text-black disabled:cursor-wait disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00FF88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101018]"
            >
              <XCircle className="h-5 w-5" aria-hidden="true" />
              Зупинити сканер
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => void startScanner()}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#00FF88] px-4 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101018]"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              Увімкнути камеру
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                void scanPhoto(file);
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || isRunning || photoBusy}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/60 hover:text-[#00FF88] disabled:cursor-wait disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101018]"
          >
            <ImageUp className="h-4 w-4" aria-hidden="true" />
            {photoBusy ? "Зчитуємо..." : "Тест з фото"}
          </button>
        </div>
      </div>
      {error ? (
        <div className="mb-3 border border-red-400/30 bg-red-400/10 p-3 text-sm leading-relaxed text-red-200">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-red-100/90">
            <li>Перевірте дозвіл камери: iPhone Settings Safari Camera Allow.</li>
            <li>Відкрийте сайт саме через https://www.rave-era.com.ua.</li>
            <li>Закрийте інші застосунки, які можуть використовувати камеру.</li>
          </ul>
        </div>
      ) : null}
      {diagnostic ? (
        <p className="mb-3 border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/50">
          {diagnostic}
        </p>
      ) : null}
      <div className="mb-3 border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/55">
        <p className="font-bold uppercase tracking-widest text-white/45">Поради для сканування</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Збільшіть яскравість екрана з квитком.</li>
          <li>Тримайте камеру на відстані 15-30 см.</li>
          <li>Тримайте QR-код повністю всередині рамки.</li>
          <li>Протріть об'єктив камери.</li>
        </ul>
      </div>
      <div className="relative aspect-square min-h-64 w-full overflow-hidden border border-white/10 bg-black">
        <div id={scannerIdRef.current} className="h-full w-full [&_img]:hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
        {isRunning ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
            <div className="aspect-square w-[75%] max-w-[280px] border-2 border-[#00FF88] bg-black/5 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            <p className="absolute bottom-5 left-4 right-4 text-xs font-black uppercase tracking-widest text-white drop-shadow">
              Наведіть QR-код у рамку
            </p>
          </div>
        ) : null}
        {!isRunning ? (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/45">
            QR камера опційна. Введіть код вручну, якщо камера недоступна.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function extractTicketCodeFromScan(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    const ticketPathMatch = safeDecode(trimmed, url.pathname).match(/\/ticket\/(SBC-2026-[A-Z0-9-]+)/i);
    if (ticketPathMatch?.[1]) {
      return ticketPathMatch[1].toUpperCase();
    }
  } catch {
    // Plain ticket codes are handled below.
  }

  const match = safeDecode(trimmed, trimmed).match(ticketCodePattern);
  return match?.[0]?.toUpperCase() || "";
}

function safeDecode(original: string, value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return original;
  }
}

async function waitForScannerContainer(elementId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await animationFrame();
    const element = document.getElementById(elementId);
    const rect = element?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      return;
    }
  }
  throw new Error("Scanner container is not ready");
}

function animationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function resetScanner(scanner: Html5Qrcode) {
  try {
    if (scanner.isScanning) {
      await scanner.stop();
    }
    scanner.clear();
  } catch {
    // Safari can release the stream while html5-qrcode is still cleaning up.
  }
}

async function startWithCameraIds(
  scanner: Html5Qrcode,
  cameraIds: string[],
  scanConfig: Html5QrcodeCameraScanConfig,
  handleSuccess: (decodedText: string) => void,
) {
  let lastError: unknown = null;
  for (const cameraId of cameraIds) {
    try {
      await resetScanner(scanner);
      await scanner.start(cameraId, scanConfig, handleSuccess, () => undefined);
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("No available camera started");
}

function selectCameraIds(cameras: CameraDevice[]): string[] {
  const rearCamera = cameras.find((camera) => /back|rear|environment|зад|основ/i.test(camera.label));
  const ids = [
    rearCamera?.id,
    cameras[cameras.length - 1]?.id,
    cameras[0]?.id,
  ].filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}

function formatDecodedPreview(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "порожній QR";
  }
  return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
}

function getCameraErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err || "");
  if (/NotAllowedError|Permission|permission|denied|NotReadableError/i.test(message)) {
    return "Доступ до камери заборонено. Дозвольте камеру для сайту та спробуйте ще раз.";
  }
  if (/NotFoundError|DevicesNotFoundError|no camera|Requested device not found/i.test(message)) {
    return "Камеру не знайдено. Перевірте підключення або введіть код вручну.";
  }
  if (/NotSupportedError|Insecure|HTTPS|secure origin/i.test(message)) {
    return "Камера доступна лише на HTTPS або localhost. Відкрийте сторінку через захищене з'єднання.";
  }
  return "Не вдалося запустити камеру. Спробуйте ще раз або введіть код вручну.";
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
