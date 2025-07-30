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
    <div className="p-20">
      <h2>QR Code Scanner</h2>
      <div id="qr-reader" className="w-[300px]"></div>
      {qrData && (
        <div className="mt-5 p-4 bg-gray-100 rounded">
          <strong>Scanned:</strong> {qrData}
        </div>
      )}
    </div>
  )
}

export default App
