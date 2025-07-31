import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"
import { serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    lrn: '',
    grade: '',
    section: '',
    parentNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);  


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const profileRef = doc(db, "students", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          navigate("/profile");
        } else {
          setLoading(false);
        }
      } else {
        navigate("/signup")
      }
    })

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      parentNumber: prev.parentNumber || "+63",
    }))
  }, [])

  useEffect(() => {
    const input = document.querySelector("input[name='parentNumber']");
    const handler = (e) => {
      if (input.selectionStart < 3) {
        e.preventDefault();
        input.setSelectionRange(3, 3);
      }
    };
    if (input) {
      input.addEventListener("keydown", handler);
    }
    return () => {
      if (input) {
        input.removeEventListener("keydown", handler);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "lrn") {
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 12);
      setFormData({...formData, [name]: limitedValue});
    } else if(name === "grade") {
      setFormData({...formData, [name]: value, section: ''})
    } else if(name === "parentNumber") {
      let input = value;

      if(!input.startsWith("+63")) {
        input = "+63" + input.replace(/\D/g, "");
      }

      const digits = input.slice(3).replace(/\D/g, "").slice(0, 10);
      const finalValue = "+63" + digits;

      setFormData({...formData, parentNumber: finalValue});
    } 
    else {
      setFormData({...formData, [name]: value})
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const docRef = doc(db, "students", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setError("A student with this LRN already exists.");
        setLoading(false);
        return;
      }

      await setDoc(docRef, {
        name: formData.name,
        lrn: formData.lrn,
        grade: parseInt(formData.grade),
        section: formData.section,
        parentNumber: formData.parentNumber,
        createdAt: serverTimestamp(),
      })
      navigate("/profile", { state: formData });
    } catch (error) {
      console.error("Error creating student profile: ", error);
      setError("Failed to create profile. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const isGrade7 = formData.grade === '7';
  const isGrade8 = formData.grade === '8';
  const isGrade9 = formData.grade === '9';
  const isGrade10 = formData.grade === '10';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Student Info</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          <input
            name="lrn"
            placeholder="LRN"
            required
            type="text"
            minLength="12"
            maxLength="12"
            inputMode="numeric"
            value={formData.lrn}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          <input
            name="grade"
            type="number"
            placeholder="Grade Level"
            min="7"
            max="12"
            required
            value={formData.grade}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          {isGrade9 ? (
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all bg-white"
              >
                <option value="" disabled>Select Section</option>
                <option value="Alfredo C. Santos">Alfredo C. Santos</option>
                <option value="Julian A. Banzon">Julian A. Banzon</option>
                <option value="Anacleto Del Rosario">Anacleto Del Rosario</option>
              </select>
          ): isGrade10 ? (
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all bg-white"
              >
                <option value="" disabled>Select Section</option>
                <option value="Gregorio Y. Zara">Gregorio Y. Zara</option>
                <option value="Francisco Quisumbing">Francisco Quisumbing</option>
              </select>
          ) : isGrade8 ? (
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all bg-white"
              >
                <option value="" disabled>Select Section</option>
                <option value="Fe Del Mundo">Fe Del Mundo</option>
                <option value="Pedro Escuro">Pedro Escuro</option>
                <option value="Angel Alcala">Angel Alcala</option>
              </select>
          ) : isGrade7 ? (
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all bg-white"
              >
                <option value="" disabled>Select Section</option>
                <option value="Eduardo San Juan">Eduardo San Juan</option>
                <option value="Casimiro Del Rosario">Casimiro Del Rosario</option>
                <option value="Josette Biyo">Josette Biyo</option>
                <option value="Arturo Alcaraz">Arturo Alcaraz</option>
              </select>
          ) : (
            <input
            name="section"
            placeholder="Section"
            required
            value={formData.section}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          )}
          <input
            name="parentNumber"
            type="tel"
            placeholder="Parent / Guardian's Contact Number"
            required
            pattern="\+63\d{10}"
            minLength="11"
            maxLength={13}
            inputMode="numeric"
            value={formData.parentNumber}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-3 rounded-xl transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Profile...
              </>
            ) : (
              'Generate Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormPage;
