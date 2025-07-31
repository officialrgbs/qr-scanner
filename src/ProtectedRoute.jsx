import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function ProtectedRoute({children}) {

  const [status, setStatus] = useState("loading");
  const [userHasData, setUserHasData] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(!user) {
        setStatus("unauthenticated");
        return;
      }

      const docRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserHasData(true);
      }
      
      setStatus("authenticated");
    })

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  // Redirect logic:
  if (location.pathname === "/") {
    return userHasData
      ? <Navigate to="/profile" replace />
      : children; // show FormPage
  }

  return children;

}

export default ProtectedRoute;