import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect, useRef } from "react"

function App() {
  const [qrData, setQrData] = useState("");
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const scannerId = "qr-reader";
    const config ={ fps: 10,qrbox: (viewfinderWidth, viewfinderHeight) => {
      return {
        width: viewfinderWidth,
        height: viewfinderHeight
      };
    } };

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">QR Code Scanner</h2>
      <div id="qr-reader" className="w-full max-w-sm aspect-square rounded-md overflow-hidden shadow-md"></div>
      {qrData && (
        <div className="mt-5 p-4 bg-gray-100 rounded text-center w-full max-w-sm">
          <strong>Scanned:</strong> {qrData}
        </div>
      )}
   </div>
  )
}

export default App
