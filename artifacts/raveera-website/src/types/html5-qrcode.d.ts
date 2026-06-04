declare module "html5-qrcode" {
  export type CameraDevice = {
    id: string;
    label: string;
  };

  export enum Html5QrcodeSupportedFormats {
    QR_CODE = 0,
  }

  type CameraConfig = string | { facingMode: { ideal: "environment" | "user" } };

  type QrboxFunction = (
    viewfinderWidth: number,
    viewfinderHeight: number,
  ) => { width: number; height: number };

  type Html5QrcodeFullConfig = {
    formatsToSupport?: Html5QrcodeSupportedFormats[];
    useBarCodeDetectorIfSupported?: boolean;
    verbose?: boolean;
  };

  type Html5QrcodeCameraScanConfig = {
    fps?: number;
    qrbox?: QrboxFunction;
    aspectRatio?: number;
    disableFlip?: boolean;
  };

  export class Html5Qrcode {
    constructor(elementId: string, config?: Html5QrcodeFullConfig);

    readonly isScanning: boolean;

    static getCameras(): Promise<CameraDevice[]>;

    start(
      cameraConfigOrId: CameraConfig,
      configuration: Html5QrcodeCameraScanConfig,
      qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void,
      qrCodeErrorCallback?: (errorMessage: string, error: unknown) => void,
    ): Promise<void>;

    stop(): Promise<void>;
    clear(): void;
  }
}
