import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Palette,
  FileText,
  Languages,
  PenTool,
  Layers,
  Send,
  GraduationCap,
  CheckCircle2,
  Lock,
  LogOut,
  Trash2,
  Clock,
  MessageSquare,
  Star,
  Info,
  Layout,
  Search,
  Zap,
  BookOpen,
  Brain,
  Facebook,
  ExternalLink,
  ArrowRight,
  User,
  Hash,
  Clipboard,
  Key,
  Users,
  Coffee,
  Target,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";

const firebaseConfig = {
  apiKey: "AIzaSyAsl8tfRQj56u2_xDT8PPA7p6aTdbBUYUs",
  authDomain: "the-desk-by-toni.firebaseapp.com",
  projectId: "the-desk-by-toni",
  storageBucket: "the-desk-by-toni.firebasestorage.app",
  messagingSenderId: "483115526737",
  appId: "1:483115526737:web:de4ede091bc5727131e670",
  measurementId: "G-6M6PPQX1QL",
};
const { appId } = firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const FB_PAGE_LINK = "https://www.facebook.com/profile.php?id=61588169784943";

const SERVICE_CATEGORIES = [
  {
    title: "🤝 Peer-to-Peer Study Services",
    services: [
      {
        id: "f2f-study",
        name: "F2F Study Session",
        price: "70/hr",
        desc: "Naga City Hub. Includes Topic Breakdown & Mock Quizzes.",
        icon: <MapPin className="text-emerald-500" />,
        isAllInclusive: true,
      },
      {
        id: "study-buddy",
        name: "Virtual Study Session",
        price: "70/hr",
        desc: "Google Meet. Includes Topic Breakdown & Mock Quizzes.",
        icon: <Users className="text-blue-500" />,
        isAllInclusive: true,
      },
    ],
  },
  {
    title: "📊 Reporting Packages",
    services: [
      {
        id: "full-rep",
        name: "Full Reporting Package",
        price: "200",
        desc: "Design + Content + Script (10 slides max)",
        icon: <Layout className="text-indigo-400" />,
      },
      {
        id: "ppt-std",
        name: "PPT Standard",
        price: "150",
        desc: "Content + Modern Design (10 slides max)",
        icon: <Palette className="text-blue-400" />,
      },
      {
        id: "plain-ppt",
        name: "Plain PPT",
        price: "100",
        desc: "Content only (Minimalist/No Design)",
        icon: <Layers className="text-slate-400" />,
      },
      {
        id: "script",
        name: "Script Only",
        price: "70",
        desc: "Detailed Reporting Script (Soft Copy)",
        icon: <MessageSquare className="text-orange-400" />,
      },
    ],
  },
  {
    title: "📝 Writing & Language",
    services: [
      {
        id: "grammar",
        name: "Grammar & Spelling",
        price: "30",
        desc: "Proofreading + Minor edits (per page)",
        icon: <CheckCircle2 className="text-emerald-400" />,
      },
      {
        id: "translate",
        name: "Translation",
        price: "50",
        desc: "English to Filipino or vice-versa (per page)",
        icon: <Languages className="text-pink-400" />,
      },
      {
        id: "essay",
        name: "Essay/Paragraph",
        price: "50",
        desc: "Filipino or English (Original Content)",
        icon: <PenTool className="text-purple-400" />,
      },
      {
        id: "reviewer",
        name: "Reviewer Making",
        price: "50-80",
        desc: "Summary per Chapter/Topic",
        icon: <BookOpen className="text-amber-400" />,
      },
    ],
  },
  {
    title: "📂 Technical & Study Tools",
    services: [
      {
        id: "flashcards",
        name: "Flashcards Making",
        price: "40",
        desc: "Anki or Quizlet (per 20 cards)",
        icon: <Brain className="text-red-400" />,
      },
      {
        id: "homework",
        name: "Homework Help",
        price: "30-50",
        desc: "Per subject/assignment assistance",
        icon: <Search className="text-cyan-400" />,
      },
      {
        id: "project",
        name: "Project Assistance",
        price: "100+",
        desc: "Layout, Research, or Encoding",
        icon: <Zap className="text-yellow-400" />,
      },
    ],
  },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: "", service: "F2F Study Session" });
  const [submittedKey, setSubmittedKey] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, "artifacts", appId, "public", "data", "orders");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(
          data.sort(
            (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
          )
        );
      },
      (err) => setError("Sync Error.")
    );
    return () => unsubscribe();
  }, [user]);

  const generateServiceKey = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleAdminLogin = () => {
    if (adminPass === "TONI_ADMIN_2026") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPass("");
    } else {
      setAdminPass("");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !user) return;
    const key = generateServiceKey();
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "orders"),
        {
          ...form,
          status: "Pending",
          serviceKey: key,
          timestamp: serverTimestamp(),
          userId: user.uid,
        }
      );
      setSubmittedKey(key);
    } catch (e) {
      setError("Error sending request.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    const docRef = doc(db, "artifacts", appId, "public", "data", "orders", id);
    await updateDoc(docRef, { status: newStatus });
  };

  const deleteOrder = async (id) => {
    const docRef = doc(db, "artifacts", appId, "public", "data", "orders", id);
    await deleteDoc(docRef);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Done":
        return "bg-emerald-100 text-emerald-600 border-emerald-200";
      default:
        return "bg-amber-100 text-amber-600 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20 relative overflow-hidden">
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="fixed top-1/2 -right-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 relative z-10">
        <nav className="flex justify-between items-center mb-10 bg-white/60 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase leading-none">
                The Desk
              </h1>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                By Toni
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={FB_PAGE_LINK}
              target="_blank"
              className="bg-[#1877F2] text-white p-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-blue-200"
            >
              <Facebook size={18} fill="white" />
            </a>
            {isAdmin && (
              <button
                onClick={() => setIsAdmin(false)}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </nav>

        {isAdmin ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end px-4">
              <h2 className="text-4xl font-black tracking-tighter text-indigo-600">
                Admin Dashboard
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {orders.length} ACTIVE ORDERS
              </p>
            </div>

            <div className="grid gap-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-lg border border-white p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-500 font-black text-xs">
                      #{order.serviceKey}
                    </div>
                    <div>
                      <h4 className="font-black text-base">{order.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        {order.service}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStatus(order.id, "Pending")}
                      className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "Confirmed")}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase"
                    >
                      Confirmed
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "Done")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase"
                    >
                      Done
                    </button>
                    <div className="w-px h-6 bg-slate-100 mx-2"></div>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-12">
              <header className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-slate-900">
                  The Desk <br />
                  <span className="text-indigo-600">By Toni.</span>
                </h2>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-full"></div>
                  <p className="text-slate-600 text-lg md:text-xl font-bold italic leading-snug">
                    Homework help? Review? Projects? <br />
                    <span className="text-indigo-500 not-italic">
                      Abot-kaya na gabay at gawa mula kay Toni. 📚✨
                    </span>
                  </p>
                </div>
              </header>

              {SERVICE_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                    {cat.title}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cat.services.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
                            {s.icon}
                          </div>
                          <div className="text-right">
                            <span className="font-black text-indigo-600 block">
                              ₱{s.price}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-black text-base">{s.name}</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-tight mt-1 opacity-70 mb-4">
                          {s.desc}
                        </p>

                        {s.isAllInclusive && (
                          <div className="pt-4 border-t border-slate-100">
                            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                              <Sparkles size={10} />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                All-In Package
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    Public Queue Status
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {orders.slice(0, 9).map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-2xl border ${getStatusColor(
                        order.status
                      )} flex flex-col items-center justify-center text-center`}
                    >
                      <span className="text-[10px] font-black opacity-60 mb-1 uppercase tracking-widest">
                        {order.status}
                      </span>
                      <span className="text-sm font-black tracking-widest">
                        #{order.serviceKey}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="col-span-full py-10 text-center text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                      No orders in queue
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl shadow-slate-300/40 border border-white sticky top-10">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Request Form
                    </span>
                  </div>

                  {submittedKey ? (
                    <div className="text-center py-8 animate-in zoom-in duration-300">
                      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black mb-1">
                        Request Submitted!
                      </h3>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">
                        Your Service Key:
                      </p>

                      <div className="bg-indigo-600 text-white p-6 rounded-[2rem] mb-8 shadow-xl shadow-indigo-200">
                        <span className="text-4xl font-black tracking-[0.2em]">
                          {submittedKey}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-500 mb-8 px-4">
                        Send this key to our Facebook Messenger along with your
                        deadline. You can track this key in the{" "}
                        <b>Public Queue</b>.
                      </p>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            document.execCommand("copy");
                            window.open(FB_PAGE_LINK, "_blank");
                          }}
                          className="bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                        >
                          Copy & Open Messenger <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => setSubmittedKey("")}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4"
                        >
                          New Request
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">
                          FB Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Toni G."
                          className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-black outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">
                          Select Service
                        </label>
                        <select
                          className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-black outline-none focus:border-indigo-300 cursor-pointer appearance-none"
                          value={form.service}
                          onChange={(e) =>
                            setForm({ ...form, service: e.target.value })
                          }
                        >
                          {SERVICE_CATEGORIES.map((cat) => (
                            <optgroup
                              key={cat.title}
                              label={cat.title.toUpperCase()}
                            >
                              {cat.services.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name} - ₱{s.price}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                        <div className="flex gap-3">
                          <Info className="text-amber-500 shrink-0" size={18} />
                          <p className="text-[11px] font-bold text-amber-700 leading-snug">
                            A{" "}
                            <span className="font-black underline">
                              Service Key
                            </span>{" "}
                            will be generated. Send it to our FB page to confirm
                            your slot.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={!form.name}
                        className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        SUBMIT ORDER <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-xl px-10 py-5 rounded-full border border-white shadow-sm min-w-[300px] justify-center">
            <a
              href={FB_PAGE_LINK}
              target="_blank"
              className="text-[#1877F2] hover:scale-125 transition-transform"
            >
              <Facebook size={20} fill="#1877F2" />
            </a>
            <div className="w-px h-6 bg-slate-200"></div>

            {showAdminLogin ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                <input
                  type="password"
                  autoFocus
                  className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black outline-none w-32 text-center placeholder:text-slate-300"
                  placeholder="ENTER KEY"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
                <button
                  onClick={handleAdminLogin}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  LOGIN
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors"
              >
                <Lock size={12} /> Admin Login
              </button>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            The Desk by Toni © 2024
          </p>
        </footer>
      </div>
    </div>
  );
}
