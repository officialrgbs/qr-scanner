import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect, useRef } from "react"

function App() {
  const [qrData, setQrData] = useState("");
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const [isScanned, setIsScanned] = useState(false);

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
                  setIsScanned(true);

                  setTimeout(() => setIsScanned(false), 2000);
                  setTimeout(() => setQrData(""), 5000);

                  return decodedText;
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
      
      {/* QR Scanner container with conditional green border animation */}
      <div 
        id="qr-reader" 
        className={`w-full max-w-sm aspect-square rounded-md overflow-hidden shadow-md transition-all duration-500 ${
          isScanned 
            ? 'border-4 border-green-500 shadow-green-200 shadow-lg' 
            : 'border-2 border-gray-200'
        }`}
      ></div>
      
      {qrData && (
        <div className="mt-5 w-full max-w-sm flex flex-col items-center">
          {/* Fixed container with proper text wrapping and mobile-friendly styling */}
          <div className="p-4 bg-gray-100 rounded text-center w-full break-words overflow-hidden">
            <strong className="block mb-2">Scanned:</strong> 
            {/* Allow long URLs/text to wrap properly on mobile */}
            <span className="break-all text-sm">{qrData}</span>
          </div>
          
          {/* Success indicator with animation */}
          <div className="mt-2 text-green-600 text-sm flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Successfully scanned
          </div>
        </div>
      )}
    </div>
  )
}

export default App
