import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

function ProfilePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStudentData(docSnap.data());
        } else {
          setError("Student profile not found")
        }
      } catch (err) {
        console.error("Error loading student data: ", err);
        setError("Failed to load profile. Please try again.")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe();
  }, [navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-md w-full">
          <p className="text-gray-700 mb-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <p className="text-gray-700 mb-4">{error || "No student data found. Please fill the form first."}</p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
          >
            Go Back to Form
          </button>
        </div>
      </div>
    );
  }


  const qrData = JSON.stringify({
    uid: auth.currentUser?.uid,
    name: studentData.name,
    lrn: studentData.lrn,
    grade: studentData.grade,
    section: studentData.section,
    parentNumber: studentData.parentNumber,
  });

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${studentData.lrn}_qr.png`;
      link.click();
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this profile?")

    if (confirmed && auth.currentUser) {
      try {
        setLoading(true);
        const uid = auth.currentUser.uid;
        await deleteDoc(doc(db, "students", uid));
        await signOut(auth);
        navigate("/", {replace:true});
      } catch (err) {
        console.error("Error deleting profile: ", err);
        setError("Failed to delete profile")
        setLoading(false)
      }
    }
  }

  const handleBackToForm = async () => {
    await signOut(auth);
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Student Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 text-gray-700 mb-6">
          <p><strong>Name:</strong> {studentData.name}</p>
          <p><strong>LRN:</strong> {studentData.lrn}</p>
          <p><strong>Grade:</strong> {studentData.grade}</p>
          <p><strong>Section:</strong> {studentData.section}</p>
          <p><strong>Parent's Contact:</strong> {studentData.parentNumber}</p>
          {studentData.createdAt?.toDate && (
            <p className="text-sm text-gray-500">
             <strong>Created:</strong>{" "}
            {studentData.createdAt.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            </p>
          )}
        </div>

        <div ref={qrRef} className="text-center">
          <p className="font-medium text-gray-800 mb-2">QR Code</p>
          <div className="inline-block bg-gray-50 p-4 rounded-xl shadow">
            <QRCodeCanvas value={qrData} size={180} />
          </div>

          <div className="mt-4 space-y-4">
            <button
              onClick={handleDownload}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition-all"
              >
              Download QR
            </button>
            <button
                onClick={handleBackToForm}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-xl font-medium transition-all"
                >
                Create New Profile
            </button>
            <button
              onClick={handleDeleteProfile}
              className="w-full bg-red-500 hover:bg-red-400 text-gray-800 py-3 rounded-xl font-medium transition-all flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
               Delete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
