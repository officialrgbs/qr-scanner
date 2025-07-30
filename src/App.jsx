import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect, useRef } from "react"

function App() {
  const [qrData, setQrData] = useState("");
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const scannerId = "qr-reader";
    const config ={ fps: 10, qrbox: 250 };

    const startScanner = async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerId);
        }

        if(!isScanningRef.current) {
          await scannerRef.current.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              setQrData((prev) => {
                if (prev !== decodedText) {
                  setTimeout(() => setQrData(""), 5000);
                  return decodedText
                }
                return prev;
              })
            },
            (errMsg) => {

            }
          );
          isScanningRef.current = true;
        }
      } catch (err) {
        console.error("Camera start error.");
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            return scannerRef.current.clear();
          })
          .then(() => {
            isScanningRef.current = false;
          })
          .catch((err) => console.error("Stop/clear error: ", err))
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
      <h2 className="text-2xl font-semibold text-center mb-4">📷 QR Code Scanner</h2>

      <div
        id="qr-reader"
        className="w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-md border border-gray-300"
      ></div>

      {qrData && (
        <div className="mt-6 p-4 w-full max-w-xs bg-white shadow-md rounded-lg border border-green-400">
          <p className="text-green-700 font-medium text-sm">✅ Scanned Data:</p>
          <p className="text-gray-800 break-all">{qrData}</p>
        </div>
      )}
    </div>
  )
}

export default App
