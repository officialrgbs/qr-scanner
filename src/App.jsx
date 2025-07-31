import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect, useRef } from "react"
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function App() {
  const [qrData, setQrData] = useState("");
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const [isScanned, setIsScanned] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");

  const processedQRsRef = useRef(new Set());

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

                  try {
                    const parsed = JSON.parse(decodedText);
                    setParsedData(parsed);

                    // Firestore Logic
                    const lrn = parsed.lrn;
                    const studentRef = doc(db, "students", lrn);
                    const now = new Date();
                    const formattedDate = now.toISOString().split("T")[0]; // e.g. "2025-07-30"

                    const todayQrKey = `${lrn}-${formattedDate}`;

                    if (processedQRsRef.current.has(todayQrKey)) {
                      setMessage("This student has already completed attendance.");
                      return decodedText;
                    }
                  
                    const formattedTime = now.toLocaleTimeString("en-US", {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }); // e.g. "07:30 AM"

                    const attendanceRef = doc(studentRef, "attendance", formattedDate);

                    getDoc(attendanceRef).then((docSnap) => {
                      if (docSnap.exists()) {
                        const data = docSnap.data();

                        if (data.timeInDate && data.timeOutDate) {
                          processedQRsRef.current.add(todayQrKey);
                          setMessage("This student has already completed attendance.");
                          return Promise.resolve();
                        } else if (data.timeInDate && !data.timeOutDate) {
                          return setDoc(attendanceRef, {
                            timeOutDate: formattedDate,
                            timeOutTime: formattedTime
                          }, { merge: true }
                          ).then(() => {
                            processedQRsRef.current.add(todayQrKey);
                          })
                        }
                      } else {
                        return setDoc(attendanceRef, {
                          timeInDate: formattedDate,
                          timeInTime: formattedTime
                        });
                      }
                    }).then(() => {
                      setMessage(`Attendance updated for ${parsed.name} (${lrn}) at ${formattedTime}`)
                    })
                    .catch((err) => {
                      setMessage(`Error writing to database: ${err.message}`)
                    })
                  } catch (err) {
                    setParsedData(null);
                  }

                  setTimeout(() => setIsScanned(false), 2000);
                  setTimeout(() => {
                    setQrData("")
                    setIsScanned(false);
                    setParsedData(null);
                    setMessage("");
                  }, 5000);

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

  const clearProcessedQrs = () => {
    processedQRsRef.current.clear();
    setMessage("Processed QR Tracking cleared.")
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main container with macOS-style card design */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        
        {/* Header with macOS-style typography */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">QR Scanner</h1>
          <p className="text-sm text-gray-500">Position QR code within the frame</p>
        </div>
        
        {/* Scanner container with modern macOS styling */}
        <div className="relative mb-6">
          <div 
            id="qr-reader" 
            className={`w-full aspect-square rounded-xl overflow-hidden transition-all duration-700 ease-out ${
              isScanned 
                ? 'ring-4 ring-green-400/50 shadow-2xl shadow-green-500/20 scale-[1.02]' 
                : 'ring-1 ring-gray-200/50 shadow-lg'
            }`}
          ></div>
          
          {/* Scanning overlay indicator */}
          {!qrData && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-white/30 rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Results section with modern card design */}
        {qrData && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {/* Scanned data card */}
            <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Detected Content
                  </p>
                  {parsedData ? (
                    <>
                      <button
                        onClick={() => setShowDetails(prev => !prev)}
                        className="text-xs text-blue-600 hover:underline mb-2"
                      >
                        {showDetails ? "Hide Details ▲" : "Show Details ▼"}
                      </button>

                      {showDetails && (
                        <div className="space-y-1 text-sm text-gray-900 font-mono">
                          <div><span className="text-gray-500">Name:</span> {parsedData.name}</div>
                          <div><span className="text-gray-500">LRN:</span> {parsedData.lrn}</div>
                          <div><span className="text-gray-500">Grade:</span> {parsedData.grade}</div>
                          <div><span className="text-gray-500">Section:</span> {parsedData.section}</div>
                          <div><span className="text-gray-500">Parent No:</span> {parsedData.parentNumber}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-red-500 font-mono break-all">
                      Invalid or non-JSON QR data:
                      <br />
                      {qrData}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Success status with macOS-style design */}
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50/50 rounded-lg py-2 px-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Successfully Scanned</span>
            </div>
          </div>
        )}
        
        {message && (
          <div className="text-center mt-2 text-sm text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow">
            {message}
          </div>
        )}

        {/* Bottom helper text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Camera access required • Auto-clears in 5 seconds
          </p>
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
    </>
  )
}

export default App
