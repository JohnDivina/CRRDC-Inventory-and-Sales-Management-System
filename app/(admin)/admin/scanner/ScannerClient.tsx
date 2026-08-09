"use client";

// app/(admin)/scanner/ScannerClient.tsx — Camera, Image Upload & Manual QR Order Scanner
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatPHP } from "@/types";
import { QrCode, Search, CheckCircle2, AlertCircle, Camera, Upload, X, StopCircle, FileImage } from "lucide-react";

export default function ScannerClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [manualOrderId, setManualOrderId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Scanned / Looked-up Order State
  const [activeOrder, setActiveOrder] = useState<{
    order: any;
    items: any[];
  } | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  // Auto-fetch if orderId is passed in URL query
  useEffect(() => {
    if (initialOrderId) {
      handleFetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const processScannedQrPayload = (decodedText: string) => {
    let parsedId = decodedText.trim();
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.orderId) parsedId = parsed.orderId;
    } catch {
      // raw string
    }

    setManualOrderId(parsedId);
    handleFetchOrder(parsedId);
  };

  // Handle Camera Scanner Initialization (Mobile camera or Desktop Webcam)
  const startCamera = async () => {
    setCameraLoading(true);
    setError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Stop existing instance if running
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const onScanSuccess = (decodedText: string) => {
        try {
          html5QrCode.stop();
        } catch {}
        setCameraActive(false);
        processScannedQrPayload(decodedText);
      };

      // Enumerate camera devices
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera hardware found on this device.");
      }

      // Use the last camera (usually back camera on mobile) or first camera (webcam on desktop)
      const selectedCameraId = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id;

      await html5QrCode.start(
        selectedCameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      let msg = err.message || "Unable to access camera.";

      if (err.name === "NotAllowedError" || String(err).includes("Permission")) {
        msg = "Camera permission was blocked by your browser. Please click the camera/lock icon in your browser address bar and select 'Allow'.";
      } else if (err.name === "NotFoundError" || String(err).includes("No camera")) {
        msg = "No camera hardware detected on this device. Please use the Upload QR Image or Manual Lookup options below.";
      } else if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        msg = "Browser camera access requires HTTPS security. Please use the Upload QR Image option.";
      }

      setError(msg);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };


  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }
    setCameraActive(false);
  };

  // Handle File Upload Scanner (Reads QR code directly from image file)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("file-reader-hidden");
      
      const decodedText = await html5QrCode.scanFile(file, false);
      try {
        html5QrCode.clear();
      } catch {}

      processScannedQrPayload(decodedText);
    } catch (err: any) {
      console.error("File QR scan error:", err);
      setError("Could not detect a valid QR code in the uploaded image. Please ensure the QR code image is clear and readable.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFetchOrder = async (orderId: string) => {
    if (!orderId.trim()) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setActiveOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      const result = await res.json();

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Order not found. Please check the Order ID.");
      }

      setActiveOrder({
        order: result.data,
        items: result.data.items || [],
      });
    } catch (err: any) {
      setError(err.message || "Could not retrieve order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeOrder) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${activeOrder.order.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Failed to confirm order payment.");
      }

      setSuccessMessage(`Order #${activeOrder.order.id.slice(0, 8)} confirmed & payment collected! Stock decremented.`);
      setActiveOrder(null);
      setManualOrderId("");
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="scanner-view">
      {/* Hidden element for file scanning */}
      <div id="file-reader-hidden" style={{ display: "none" }}></div>

      <header className="scanner-header">
        <h1 className="scanner-title">QR Code Scanner &amp; Order Fulfiller</h1>
        <p className="scanner-subtitle">
          Scan a customer&apos;s transaction QR code via camera, upload an image of the QR code, or enter their Order ID manually.
        </p>
      </header>

      {successMessage && (
        <div className="alert alert--success">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={20} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="scanner-grid">
        {/* Box 1: Live Camera Scanner */}
        <div className="scanner-box">
          <div className="scanner-box__header">
            <Camera size={20} className="header-icon" aria-hidden="true" />
            <h2 className="box-title">Camera Scanner</h2>
          </div>
          <p className="box-desc">Use a webcam or mobile camera to scan the customer&apos;s QR code live.</p>

          <div id="reader" className="camera-viewport" ref={scannerRef}>
            {!cameraActive && (
              <div className="camera-placeholder">
                <QrCode size={48} className="placeholder-icon" aria-hidden="true" />
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="start-cam-btn"
                >
                  {cameraLoading ? "Initializing Camera..." : "Open Camera Scanner"}
                </button>
              </div>
            )}
          </div>

          {cameraActive && (
            <button type="button" onClick={stopCamera} className="stop-cam-btn">
              <StopCircle size={16} aria-hidden="true" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>

        {/* Box 2: Upload QR Image File */}
        <div className="scanner-box">
          <div className="scanner-box__header">
            <Upload size={20} className="header-icon" aria-hidden="true" />
            <h2 className="box-title">Upload QR Image</h2>
          </div>
          <p className="box-desc">Upload a screenshot or photo of the customer&apos;s QR code (ideal for computers without webcams).</p>

          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileImage size={40} className="upload-icon" aria-hidden="true" />
            <span className="upload-text">Click to choose or drag &amp; drop QR image</span>
            <span className="upload-subtext">PNG, JPG, WEBP formats supported</span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Box 3: Manual Order ID Lookup Form */}
      <div className="lookup-box">
        <h2 className="box-title">Manual Order ID Lookup</h2>
        <p className="box-desc">Enter or paste the Order ID printed below the customer&apos;s QR code:</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchOrder(manualOrderId);
          }}
          className="lookup-form"
        >
          <div className="input-row">
            <input
              type="text"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={manualOrderId}
              onChange={(e) => setManualOrderId(e.target.value)}
              className="order-id-input"
            />
            <button type="submit" disabled={loading} className="lookup-btn">
              <Search size={16} aria-hidden="true" />
              <span>{loading ? "Searching..." : "Lookup Order"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Order Confirmation Modal */}
      {activeOrder && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Confirm Order Payment</h3>
                <span className="modal-id">ID: <code>{activeOrder.order.id}</code></span>
              </div>
              <button type="button" onClick={() => setActiveOrder(null)} className="close-btn">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="modal-body">
              <div className="status-row">
                <span>Current Status:</span>
                <span className="status-badge" data-status={activeOrder.order.status}>
                  {activeOrder.order.status.toUpperCase()}
                </span>
              </div>

              <div className="total-highlight">
                <span>Total Cash Amount Due:</span>
                <span className="price-tag">{formatPHP(Number(activeOrder.order.total_price_php))}</span>
              </div>

              {activeOrder.items && activeOrder.items.length > 0 && (
                <div className="modal-items-list">
                  <span className="items-title">Purchased Items:</span>
                  <ul>
                    {activeOrder.items.map((item: any, idx: number) => (
                      <li key={idx} className="item-row">
                        <span>{item.quantity}x {item.unit_type}</span>
                        <span className="item-price">{formatPHP(Number(item.line_total_php))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-notice">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>
                  Confirming this order will mark payment as received and atomically decrement item stock quantities in the database.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setActiveOrder(null)} className="cancel-btn">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirming || activeOrder.order.status === "completed"}
                className="confirm-btn"
              >
                {confirming
                  ? "Processing..."
                  : activeOrder.order.status === "completed"
                  ? "Already Completed"
                  : "Confirm Payment Received"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scanner-view { display: flex; flex-direction: column; gap: var(--space-6); max-width: 960px; }
        .scanner-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .scanner-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .alert { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: 500; }
        .alert--success { background-color: oklch(from var(--color-success) l c h / 0.12); color: var(--color-primary); border: 1px solid var(--color-primary); }
        .alert--error { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .scanner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
        .scanner-box, .lookup-box { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); }

        .scanner-box__header { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
        .header-icon { color: var(--color-primary); }
        .box-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-heading); margin: 0; }
        .box-desc { font-size: var(--text-xs); color: var(--color-ink-2); margin: 0 0 var(--space-4); }

        .camera-viewport { aspect-ratio: 4 / 3; background-color: var(--color-paper-2); border: 2px dashed var(--color-border); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .camera-placeholder { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); text-align: center; padding: var(--space-4); }
        .placeholder-icon { color: var(--color-primary); opacity: 0.5; }
        .start-cam-btn { padding: var(--space-3) var(--space-5); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; transition: opacity var(--dur-fast); }
        .start-cam-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .stop-cam-btn { margin-top: var(--space-3); width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-xs); cursor: pointer; }

        .upload-dropzone { aspect-ratio: 4 / 3; background-color: var(--color-paper-2); border: 2px dashed var(--color-border); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4); text-align: center; cursor: pointer; transition: border-color var(--dur-fast), background-color var(--dur-fast); }
        .upload-dropzone:hover { border-color: var(--color-primary); background-color: oklch(from var(--color-primary) l c h / 0.04); }
        .upload-icon { color: var(--color-primary); }
        .upload-text { font-size: var(--text-sm); font-weight: 600; color: var(--color-heading); }
        .upload-subtext { font-size: var(--text-xs); color: var(--color-ink-3); }

        .lookup-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .input-row { display: flex; gap: var(--space-2); }
        .order-id-input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: var(--text-sm); }
        .lookup-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; }

        /* Modal */
        .order-modal-backdrop { position: fixed; inset: 0; background-color: oklch(0% 0 0 / 0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: var(--space-4); }
        .order-modal { background-color: var(--color-paper); border-radius: var(--radius-xl); max-width: 500px; width: 100%; padding: var(--space-6); box-shadow: 0 10px 40px oklch(0% 0 0 / 0.3); }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-4); }
        .modal-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-heading); margin: 0 0 2px; }
        .modal-id { font-size: var(--text-xs); color: var(--color-ink-3); }
        .close-btn { background: none; border: none; cursor: pointer; color: var(--color-ink-3); }

        .modal-body { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-6); }
        .status-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-ink-2); }
        .status-badge { font-size: var(--text-xs); font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-badge[data-status="pending"] { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .status-badge[data-status="completed"] { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }

        .total-highlight { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); background-color: var(--color-paper-2); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); }
        .price-tag { font-family: var(--font-mono); font-size: var(--text-xl); color: var(--color-heading); font-weight: 700; }

        .modal-items-list { font-size: var(--text-xs); background-color: var(--color-paper-2); padding: var(--space-3); border-radius: var(--radius-md); }
        .items-title { font-weight: 600; color: var(--color-heading); margin-bottom: var(--space-2); display: block; }
        .modal-items-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .item-row { display: flex; justify-content: space-between; color: var(--color-ink-2); }
        .item-price { font-family: var(--font-mono); font-weight: 600; }

        .modal-notice { display: flex; gap: var(--space-2); font-size: var(--text-xs); color: var(--color-ink-2); line-height: 1.4; background-color: oklch(from var(--color-primary) l c h / 0.06); padding: var(--space-3); border-radius: var(--radius-md); }

        .modal-footer { display: flex; justify-content: flex-end; gap: var(--space-3); }
        .cancel-btn { padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); background: var(--color-paper); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; }
        .confirm-btn { padding: var(--space-3) var(--space-6); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; }
        .confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 768px) { .scanner-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
