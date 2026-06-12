import React, { useState, useEffect } from "react";
import { db, auth, signInAdminWithGoogle, logOutAdmin, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  Shield, 
  LogIn, 
  LogOut, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Calendar, 
  Award, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  ChevronRight, 
  User, 
  Building,
  ExternalLink,
  MessageSquare,
  MapPin,
  FileSpreadsheet
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Tabs: "applications" | "contacts"
  const [activeTab, setActiveTab] = useState<"applications" | "contacts">("applications");

  // Filters & Search
  const [appSearch, setAppSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [contactSearch, setContactSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

  // Detailed selected records
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
      
      // Check if user is the authorized admin email
      if (user) {
        const email = user.email || "";
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@dealschool.in";
        const authorized = email === adminEmail;
        setIsAdminAuthorized(authorized);
      } else {
        setIsAdminAuthorized(false);
      }
    });
    return unsubscribe;
  }, []);

  // Live Subscription to Firestore Collections
  useEffect(() => {
    if (!currentUser || !isAdminAuthorized) {
      setApplications([]);
      setContacts([]);
      return;
    }

    setDbLoading(true);
    setDbError(null);

    // 1. Listen to Fellowship Applications
    const applicationsQuery = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

    const unsubApps = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        const appsList: any[] = [];
        snapshot.forEach((doc) => {
          appsList.push({ id: doc.id, ...doc.data() });
        });
        setApplications(appsList);
        setDbLoading(false);
      },
      (error) => {
        console.error("Firestore applications subscription failed:", error);
        setDbError("Access denied. Please ensure your user email is authorized in firestore.rules.");
        setDbLoading(false);
      }
    );

    // 2. Listen to Contacts Inquiry Logs
    const contactsQuery = query(
      collection(db, "contacts"),
      orderBy("createdAt", "desc")
    );

    const unsubContacts = onSnapshot(
      contactsQuery,
      (snapshot) => {
        const contactsList: any[] = [];
        snapshot.forEach((doc) => {
          contactsList.push({ id: doc.id, ...doc.data() });
        });
        setContacts(contactsList);
      },
      (error) => {
        console.error("Firestore contacts subscription failed:", error);
      }
    );

    return () => {
      unsubApps();
      unsubContacts();
    };
  }, [currentUser, isAdminAuthorized]);

  // Auth Handlers
  const handleLogin = async () => {
    try {
      setDbError(null);
      await signInAdminWithGoogle();
    } catch (err: any) {
      console.error("Login failure:", err);
      setDbError(err.message || "Unable to complete Google Authentication.");
    }
  };

  const handleLogout = async () => {
    try {
      await logOutAdmin();
      setSelectedApp(null);
      setSelectedContact(null);
    } catch (err: any) {
      console.error("Logout failure:", err);
    }
  };

  // Status Action Handler for Applications
  const handleUpdateAppStatus = async (appId: string, transitionStatus: string) => {
    try {
      const docRef = doc(db, "applications", appId);
      await updateDoc(docRef, {
        status: transitionStatus,
        updatedAt: serverTimestamp()
      });
      // Sync selected modal context
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev: any) => ({ ...prev, status: transitionStatus }));
      }
    } catch (err: any) {
      console.error("Error updating application status:", err);
      alert(`Status update failed: ${err.message}`);
      handleFirestoreError(err, OperationType.UPDATE, `applications/${appId}`);
    }
  };

  // Delete Record Handler for Applications
  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this application record?")) return;
    try {
      await deleteDoc(doc(db, "applications", appId));
      setSelectedApp(null);
    } catch (err: any) {
      alert(`Delete operation failed: ${err.message}`);
      handleFirestoreError(err, OperationType.DELETE, `applications/${appId}`);
    }
  };

  // Message Actions for Inquiries
  const handleUpdateContactStatus = async (contactId: string, targetStatus: string) => {
    try {
      const docRef = doc(db, "contacts", contactId);
      await updateDoc(docRef, { status: targetStatus });
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact((prev: any) => ({ ...prev, status: targetStatus }));
      }
    } catch (err: any) {
      console.error("Error updating enquiry status:", err);
      handleFirestoreError(err, OperationType.UPDATE, `contacts/${contactId}`);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to remove this general inquiry archive?")) return;
    try {
      await deleteDoc(doc(db, "contacts", contactId));
      setSelectedContact(null);
    } catch (err: any) {
      alert(`Delete inquiry failed: ${err.message}`);
      handleFirestoreError(err, OperationType.DELETE, `contacts/${contactId}`);
    }
  };

  // Filters & Searches computations
  const filteredApps = applications.filter((app) => {
    const term = appSearch.toLowerCase();
    
    // Check nested/dynamic fields depending on current status alignment
    const statusTextDetail = 
      (app.collegeName || "") + 
      (app.companyName || "") + 
      (app.startupName || "") + 
      (app.areaOfWork || "") + 
      (app.city || "") + 
      (app.currentStatus || "");

    const matchesSearch = 
      (app.fullName || "").toLowerCase().includes(term) ||
      (app.email || "").toLowerCase().includes(term) ||
      statusTextDetail.toLowerCase().includes(term);

    const matchesStatusAlignment = sectorFilter === "all" || app.currentStatus === sectorFilter;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatusAlignment && matchesStatus;
  });

  const filteredContacts = contacts.filter((c) => {
    const term = contactSearch.toLowerCase();
    const matchesSearch = 
      (c.name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term) ||
      (c.subject || "").toLowerCase().includes(term) ||
      (c.message || "").toLowerCase().includes(term);

    const matchesStatus = contactStatusFilter === "all" || c.status === contactStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Render Time Cleanly
  const renderTimestamp = (timestampObj: any) => {
    if (!timestampObj) return "N/A";
    const date = timestampObj?.toDate ? timestampObj.toDate() : new Date(timestampObj);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Guard loading profile check
  if (isAuthChecking) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-[#111111]/10 border-l-[#D4A62A] rounded-full animate-spin"></div>
        <p className="font-mono text-xs text-brand-neutral tracking-widest uppercase">
          Verifying Identity Registry...
        </p>
      </div>
    );
  }

  // Login Screen
  if (!currentUser) {
    return (
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-md mx-auto bg-brand-bg border border-brand-secondary/15 rounded-sm p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto h-12 w-12 bg-brand-accent/10 border border-[#D4A62A]/25 rounded-md flex items-center justify-center text-brand-accent">
            <Shield className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.25em] font-bold block uppercase">
              Admissions Underwriting Login
            </span>
            <h3 className="font-serif text-2xl font-bold text-brand-text">
              Supervisor Portal
            </h3>
            <p className="font-sans text-xs text-brand-neutral leading-relaxed">
              Unlock real-time view over candidate enrollment queues, application underwriting records, and institutional feedback channels.
            </p>
          </div>

          {dbError && (
            <div className="bg-red-55/10 border border-red-500/20 p-3 text-red-700 text-xs text-left flex gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{dbError}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-4 bg-brand-secondary hover:bg-brand-dark-blue text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-secondary/25"
          >
            <LogIn className="h-4 w-4 text-brand-accent" /> Log In with Enterprise Google
          </button>
        </div>
      </section>
    );
  }

  // Not Authorized Screen
  if (!isAdminAuthorized) {
    return (
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-md mx-auto bg-brand-bg border border-red-500/25 rounded-sm p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto h-12 w-12 bg-red-100/30 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-brand-text">
              Access Restricted
            </h3>
            <p className="font-sans text-xs text-brand-neutral leading-relaxed">
              Your account is not authorized to access the DealSchool Supervisor Portal.
            </p>
            <p className="font-sans text-xs text-brand-neutral leading-relaxed">
              If you believe this is an error, please contact the DealSchool team.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-brand-secondary text-[#FAFAF8] font-mono text-xs font-bold uppercase hover:bg-brand-dark-blue cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Counters
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === "pending").length;
  const underReviewApps = applications.filter(a => a.status === "under_review").length;
  const acceptedApps = applications.filter(a => a.status === "accepted").length;
  const totalContacts = contacts.length;
  const unreadContacts = contacts.filter(c => c.status === "unread").length;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-fade-in">
      
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-secondary/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              GP SUPERVISOR CORE
            </span>
            <span className="font-mono text-[9px] bg-brand-secondary text-brand-bg px-2 py-0.5 rounded-sm uppercase tracking-wider">
              REAL-TIME SECURED
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-brand-text mt-1">
            Admissions Underwriting Board
          </h2>
          <p className="font-sans text-xs text-brand-neutral mt-1">
            Reviewing applications as GP administrator: <span className="font-bold text-brand-secondary">{currentUser.email}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-transparent border border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary hover:text-brand-bg px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer self-start md:self-center"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-brand-bg border border-brand-secondary/10 p-4 rounded-sm shadow-xs">
          <span className="block font-mono text-[9px] text-brand-neutral uppercase tracking-widest">Applications Recv</span>
          <span className="block font-serif text-3xl font-black text-brand-text mt-1">{totalApps}</span>
        </div>
        <div className="bg-brand-bg border border-brand-secondary/10 p-4 rounded-sm shadow-xs">
          <span className="block font-mono text-[9px] text-[#D4A62A] uppercase tracking-widest">Pending Audit</span>
          <span className="block font-serif text-3xl font-black text-[#D4A62A] mt-1">{pendingApps}</span>
        </div>
        <div className="bg-brand-bg border border-brand-secondary/10 p-4 rounded-sm shadow-xs">
          <span className="block font-mono text-[9px] text-brand-secondary uppercase tracking-widest font-semibold">Under Review</span>
          <span className="block font-serif text-3xl font-black text-brand-secondary mt-1">{underReviewApps}</span>
        </div>
        <div className="bg-brand-bg border border-brand-secondary/10 p-4 rounded-sm shadow-xs">
          <span className="block font-mono text-[9px] text-green-700 uppercase tracking-widest font-semibold">Accepted Fellows</span>
          <span className="block font-serif text-3xl font-black text-green-700 mt-1">{acceptedApps}</span>
        </div>
        <div className="bg-brand-bg border border-brand-secondary/10 col-span-2 lg:col-span-1 p-4 rounded-sm shadow-xs">
          <span className="block font-mono text-[9px] text-blue-700 uppercase tracking-widest font-semibold">Unread Messages</span>
          <span className="block font-serif text-3xl font-black text-blue-700 mt-1">{unreadContacts}</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-brand-secondary/10 gap-6">
        <button
          onClick={() => { setActiveTab("applications"); setSelectedContact(null); }}
          className={`pb-3 font-mono text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
            activeTab === "applications" ? "text-brand-accent font-bold" : "text-brand-neutral hover:text-brand-text"
          }`}
        >
          Candidate Applications ({applications.length})
          {activeTab === "applications" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-accent"></div>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("contacts"); setSelectedApp(null); }}
          className={`pb-3 font-mono text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
            activeTab === "contacts" ? "text-brand-accent font-bold" : "text-brand-neutral hover:text-brand-text"
          }`}
        >
          General Messages Logs ({contacts.length})
          {activeTab === "contacts" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-accent"></div>
          )}
        </button>
      </div>

      {/* Database Global Errors Warning */}
      {dbError && (
        <div className="bg-red-50 border border-red-300 p-4 text-red-800 text-xs rounded-sm mb-4">
          {dbError}
        </div>
      )}

      {/* LISTS AND CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Filterable Lists (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TAB 1: APPLICATIONS LIST */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              
              {/* Search & Select Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-brand-bg p-4 border border-brand-secondary/10 rounded-sm">
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search candidate name, email, university..."
                    className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-3 py-2 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="w-full bg-[#FCFAF6] text-brand-text px-2.5 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs h-[38px] cursor-pointer"
                  >
                    <option value="all">Archetype: All</option>
                    <option value="Student">Student</option>
                    <option value="Recent Graduate (0–2 years of experience)">Recent Graduate</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Founder">Founder</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#FCFAF6] text-brand-text px-2.5 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs h-[38px]"
                  >
                    <option value="all">Status: All</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="interview_invited">Interview Invited</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Loader */}
              {dbLoading && (
                <div className="py-20 text-center text-brand-neutral text-xs font-mono tracking-widest uppercase">
                  Syncing live cloud database applications...
                </div>
              )}

              {/* Empty state */}
              {!dbLoading && filteredApps.length === 0 && (
                <div className="bg-[#FAF7F0] border border-brand-secondary/15 p-12 text-center rounded-sm space-y-2">
                  <p className="font-serif text-lg font-bold text-brand-text">No Matching Candidates Found</p>
                  <p className="font-sans text-xs text-brand-neutral">
                    Change your search text query parameters, reset sectors, or statuses filters above.
                  </p>
                </div>
              )}

              {/* Rows List */}
              <div className="space-y-3">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`bg-brand-bg border rounded-sm p-4 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      selectedApp?.id === app.id ? "border-brand-accent ring-2 ring-brand-accent/5 bg-[#FCFAF6]" : "border-brand-secondary/10"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-base font-bold text-brand-text">
                          {app.fullName}
                        </span>
                        <span className="font-mono text-[9px] bg-[#152238]/5 border border-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-sm font-semibold">
                          {app.currentStatus}
                        </span>
                        
                        {/* Status Badges */}
                        {app.status === "pending" && (
                          <span className="font-mono text-[9px] bg-[#D4A62A]/10 text-[#D4A62A] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                            Pending Audit
                          </span>
                        )}
                        {app.status === "under_review" && (
                          <span className="font-mono text-[9px] bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                            Under Review
                          </span>
                        )}
                        {app.status === "interview_invited" && (
                          <span className="font-mono text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                            Interview Invited
                          </span>
                        )}
                        {app.status === "accepted" && (
                          <span className="font-mono text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                            Accepted Fellow
                          </span>
                        )}
                        {app.status === "declined" && (
                          <span className="font-mono text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                            Declined
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 md:gap-4 font-mono text-[10px] text-brand-neutral">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {app.city || "Unspecified City"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" /> {app.collegeName || app.companyName || app.startupName || "Individual Affiliate"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span className="font-mono text-[9px] text-brand-neutral mr-2">
                        {renderTimestamp(app.createdAt)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-brand-neutral opacity-50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL CONTACT INQUIRIES */}
          {activeTab === "contacts" && (
            <div className="space-y-4">
              
              {/* Filter Inquiry panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-brand-bg p-4 border border-brand-secondary/10 rounded-sm">
                <div className="md:col-span-8 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search sender, email, inquiry content topic..."
                    className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-3 py-2 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs"
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={contactStatusFilter}
                    onChange={(e) => setContactStatusFilter(e.target.value)}
                    className="w-full bg-[#FCFAF6] text-brand-text px-2.5 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs h-[38px]"
                  >
                    <option value="all">Status: All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Empty state */}
              {filteredContacts.length === 0 && (
                <div className="bg-[#FAF7F0] border border-brand-secondary/15 p-12 text-center rounded-sm">
                  <p className="font-serif text-lg font-bold text-brand-text">No Messages Found</p>
                  <p className="font-sans text-xs text-brand-neutral mt-1">
                    Clear spelling or filter rules. Real visitors can write messages using the contacts form.
                  </p>
                </div>
              )}

              {/* Inquiries Row */}
              <div className="space-y-3">
                {filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`bg-brand-bg border rounded-sm p-4 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      selectedContact?.id === c.id ? "border-brand-accent bg-[#FCFAF6]" : "border-brand-secondary/10"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-sm font-bold text-brand-text">
                          {c.name}
                        </span>
                        
                        {c.status === "unread" && (
                          <span className="font-mono text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-bold uppercase">
                            Unread
                          </span>
                        )}
                        {c.status === "read" && (
                          <span className="font-mono text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm">
                            Read
                          </span>
                        )}
                        {c.status === "archived" && (
                          <span className="font-mono text-[9px] bg-[#FAF7F0] border border-brand-secondary/10 text-brand-neutral px-2 py-0.5 rounded-sm">
                            Archived
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-xs text-brand-secondary line-clamp-1">
                        <span className="font-bold underline">{c.subject}:</span> {c.message}
                      </p>

                      <div className="font-mono text-[10px] text-brand-neutral">
                        {c.email}
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-brand-neutral shrink-0">
                      {renderTimestamp(c.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Detailed Selection Inspection Panel (4 Columns) */}
        <div className="lg:col-span-4">
          
          {/* Detailed Applications Profile View */}
          {activeTab === "applications" && (
            <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 shadow-md space-y-6 sticky top-6">
              {selectedApp ? (
                <>
                  <div className="border-b border-brand-secondary/10 pb-4 space-y-2">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold block uppercase">
                      Underwriting Candidate
                    </span>
                    <h3 className="font-serif text-xl font-bold text-brand-text">
                      {selectedApp.fullName}
                    </h3>
                    <p className="font-mono text-xs text-brand-neutral underline flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-brand-accent" /> {selectedApp.email}
                    </p>
                  </div>

                  <div className="space-y-4 font-serif text-xs md:text-sm text-brand-secondary max-h-[64vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3 border-b border-brand-secondary/5 pb-3">
                      <div>
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                          MOBILE RECORD:
                        </span>
                        <p className="font-semibold text-brand-text font-sans text-xs">{selectedApp.mobileNumber || "N/A"}</p>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                          CITY BASE:
                        </span>
                        <p className="font-semibold text-brand-text font-sans text-xs">{selectedApp.city || "N/A"}</p>
                      </div>
                    </div>

                    <div className="border-b border-brand-secondary/5 pb-3">
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                        PERSONAL LINKEDIN:
                      </span>
                      {selectedApp.linkedinUrl ? (
                        <a
                          href={selectedApp.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-xs text-brand-accent hover:underline flex items-center gap-1 font-semibold truncate"
                        >
                          {selectedApp.linkedinUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-xs text-brand-neutral italic">None provided</p>
                      )}
                    </div>

                    <div className="bg-[#FAF8F5] p-3 border border-brand-secondary/10 rounded-sm space-y-2">
                      <span className="block font-mono text-[9px] text-[#D4A62A] tracking-wider font-bold uppercase">
                        ALIGNMENT: {selectedApp.currentStatus}
                      </span>
                      
                      {selectedApp.currentStatus === "Student" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>College name:</strong> {selectedApp.collegeName}</p>
                          <p><strong>Degree focus:</strong> {selectedApp.degree}</p>
                          <p><strong>Graduation Year:</strong> {selectedApp.graduationYear}</p>
                        </div>
                      )}

                      {selectedApp.currentStatus === "Recent Graduate (0–2 years of experience)" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>Current Role:</strong> {selectedApp.currentRole}</p>
                          <p><strong>Company name:</strong> {selectedApp.companyName}</p>
                          <p><strong>Graduation Year:</strong> {selectedApp.graduationYear}</p>
                          <p><strong>Educational Background:</strong> {selectedApp.degreeEducationalBackground}</p>
                        </div>
                      )}

                      {selectedApp.currentStatus === "Working Professional" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>Current Role:</strong> {selectedApp.currentRole}</p>
                          <p><strong>Company Name:</strong> {selectedApp.companyName}</p>
                          <p><strong>Experience:</strong> {selectedApp.yearsOfExperience}</p>
                        </div>
                      )}

                      {selectedApp.currentStatus === "Founder" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>Startup:</strong> {selectedApp.startupName}</p>
                          <p><strong>Sector Domain:</strong> {selectedApp.industrySector}</p>
                          <p><strong>Startup LinkedIn:</strong> <a href={selectedApp.startupLinkedinProfile} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline inline-flex items-center gap-0.5">{selectedApp.startupLinkedinProfile ? "View Startup Profile" : "None"} <ExternalLink className="h-2.5 w-2.5" /></a></p>
                        </div>
                      )}

                      {selectedApp.currentStatus === "Freelancer" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>Area of Work:</strong> {selectedApp.areaOfWork}</p>
                          <p><strong>Experience:</strong> {selectedApp.yearsOfExperience}</p>
                          <p><strong>LinkedIn Portfolio:</strong> <a href={selectedApp.freelancerLinkedinProfile} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline inline-flex items-center gap-0.5">{selectedApp.freelancerLinkedinProfile ? "View Profile" : "None"} <ExternalLink className="h-2.5 w-2.5" /></a></p>
                        </div>
                      )}

                      {selectedApp.currentStatus === "Other" && (
                        <div className="space-y-1 font-sans text-xs">
                          <p><strong>Specified Archetype:</strong> {selectedApp.otherStatusSpecify}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-b border-brand-secondary/5 pb-3">
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                        PRIMARY REASON FOR JOINING:
                      </span>
                      <p className="font-semibold text-brand-text text-xs leading-relaxed">
                        {selectedApp.primaryReason === "Other" ? selectedApp.primaryReasonOther : selectedApp.primaryReason}
                      </p>
                    </div>

                    <div className="space-y-2.5 border-b border-brand-secondary/5 pb-3">
                      <h4 className="font-mono text-[9px] uppercase tracking-wider text-brand-neutral">Thesis Assessments</h4>
                      
                      <div className="space-y-1 bg-[#FCFAF6] p-3 border border-brand-secondary/10 rounded-sm">
                        <span className="block font-sans text-[10px] font-bold text-brand-secondary leading-relaxed">Q1: Cash-burning high marketing growth evaluation</span>
                        <p className="text-brand-neutral text-xs leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto italic font-sans">
                          "{selectedApp.assessmentQ1}"
                        </p>
                      </div>

                      <div className="space-y-1 bg-[#FCFAF6] p-3 border border-brand-secondary/10 rounded-sm">
                        <span className="block font-sans text-[10px] font-bold text-brand-secondary leading-relaxed font-sans">Q2: ₹10 lakhs sector choose & why</span>
                        <p className="text-brand-neutral text-xs leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto italic font-sans animate-fadeIn">
                          "{selectedApp.assessmentQ2}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center bg-[#FAF8F5] p-2 border border-brand-secondary/10 rounded-sm font-sans text-xs">
                        <span className="font-bold">Q3: Most vital in early-stage:</span>
                        <span className="bg-brand-secondary text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider font-sans">{selectedApp.assessmentQ3}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-b border-brand-secondary/5 pb-3 font-sans">
                      <div>
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                          DISCOVERY CHANNEL:
                        </span>
                        <p className="font-semibold text-brand-text text-xs uppercase">{selectedApp.discoverySource === "Other" ? selectedApp.discoverySourceOther : selectedApp.discoverySource}</p>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-0.5">
                          SUBMITTED TIME:
                        </span>
                        <p className="font-mono text-[11px] text-brand-neutral">{renderTimestamp(selectedApp.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-accent font-bold mb-1">
                        CANDIDATE RESUME URL:
                      </span>
                      {selectedApp.resumeLink || selectedApp.resumeUrl ? (
                        <div className="space-y-2">
                          <a
                            href={selectedApp.resumeLink || selectedApp.resumeUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-brand-accent hover:underline flex items-center gap-1.5 font-bold bg-[#FAF8F5] p-3 border border-brand-accent/20 rounded-sm justify-center shadow-xs cursor-pointer group"
                          >
                            <ExternalLink className="h-4 w-4 text-brand-accent group-hover:scale-105 transition-transform shrink-0" /> OPEN RESUME
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedApp.resumeLink || selectedApp.resumeUrl || "");
                              alert("Resume link copied to clipboard!");
                            }}
                            className="w-full font-mono text-[10px] text-brand-text hover:bg-brand-secondary/5 flex items-center gap-1.5 font-bold bg-[#FAF8F5] p-2 border border-brand-secondary/10 rounded-sm justify-center shadow-xs cursor-pointer"
                          >
                            COPY RESUME LINK
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-brand-neutral italic">None provided</p>
                      )}
                    </div>
                  </div>

                  {/* Actions status transition dashboard */}
                  <div className="border-t border-brand-secondary/10 pt-4 space-y-3">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-accent font-bold">
                      GPs Admissions Assessment Decision:
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateAppStatus(selectedApp.id, "under_review")}
                        className={`py-2 text-[10px] font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
                          selectedApp.status === "under_review" 
                            ? "bg-brand-secondary text-brand-bg border-brand-secondary" 
                            : "bg-transparent border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary/5"
                        }`}
                      >
                        Auditing
                      </button>

                      <button
                        onClick={() => handleUpdateAppStatus(selectedApp.id, "interview_invited")}
                        className={`py-2 text-[10px] font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
                          selectedApp.status === "interview_invited" 
                            ? "bg-purple-700 text-white border-purple-700" 
                            : "bg-transparent border-purple-500/25 text-purple-700 hover:bg-purple-500/5"
                        }`}
                      >
                        Invite Interview
                      </button>

                      <button
                        onClick={() => handleUpdateAppStatus(selectedApp.id, "accepted")}
                        className={`py-2 text-[10px] font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
                          selectedApp.status === "accepted" 
                            ? "bg-green-700 text-white border-green-700 font-bold" 
                            : "bg-transparent border-green-500/25 text-green-700 hover:bg-green-500/5"
                        }`}
                      >
                        ★ Accept Fellow
                      </button>

                      <button
                        onClick={() => handleUpdateAppStatus(selectedApp.id, "declined")}
                        className={`py-2 text-[10px] font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
                          selectedApp.status === "declined" 
                            ? "bg-red-700 text-white border-red-700" 
                            : "bg-transparent border-red-500/25 text-red-700 hover:bg-red-50/5"
                        }`}
                      >
                        Decline
                      </button>
                    </div>

                    <div className="pt-2 border-t border-brand-secondary/5">
                      <button
                        onClick={() => handleDeleteApplication(selectedApp.id)}
                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[9px] font-bold uppercase rounded-sm border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Purge Candidate Record
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="mx-auto h-8 w-8 text-brand-neutral opacity-25">
                    <User className="h-full w-full" />
                  </div>
                  <p className="font-serif italic text-xs text-brand-neutral">
                    Select a fellowship applicant profile from the grid table for active underwriting.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Detailed Contacts View */}
          {activeTab === "contacts" && (
            <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 shadow-md space-y-6 sticky top-6">
              {selectedContact ? (
                <>
                  <div className="border-b border-brand-secondary/10 pb-4 space-y-2">
                    <span className="font-mono text-[9px] text-[#4F46E5] tracking-[0.25em] font-bold block uppercase">
                      Inquiry Message Log
                    </span>
                    <h3 className="font-serif text-lg font-bold text-brand-text">
                      Sender: {selectedContact.name}
                    </h3>
                    <p className="font-mono text-xs text-brand-neutral underline">
                      {selectedContact.email}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral">
                        SUBJECT MATTER:
                      </span>
                      <p className="font-serif text-sm font-bold text-brand-text mt-0.5">
                        {selectedContact.subject}
                      </p>
                    </div>

                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-1">
                        MESSAGE BODY:
                      </span>
                      <p className="bg-[#FAF7F0] p-4 text-brand-neutral border border-brand-secondary/10 rounded-sm leading-relaxed font-sans text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>

                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral">
                        RECEIVED AT:
                      </span>
                      <p className="font-mono text-xs text-brand-neutral">
                        {renderTimestamp(selectedContact.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions for messages */}
                  <div className="border-t border-brand-secondary/10 pt-4 space-y-3">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-[#4F46E5] font-bold">
                      Moderate Message Archive:
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateContactStatus(selectedContact.id, "read")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase rounded-sm border cursor-pointer transition-all ${
                          selectedContact.status === "read"
                            ? "bg-brand-secondary text-brand-bg border-brand-secondary"
                            : "bg-transparent border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary/5"
                        }`}
                      >
                        Mark Read
                      </button>

                      <button
                        onClick={() => handleUpdateContactStatus(selectedContact.id, "archived")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase rounded-sm border cursor-pointer transition-all relative overflow-hidden ${
                          selectedContact.status === "archived"
                            ? "bg-gray-700 text-white border-gray-700"
                            : "bg-transparent border-gray-500/25 text-gray-700 hover:bg-gray-100/5"
                        }`}
                      >
                        Archive
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(selectedContact.id)}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[9px] font-bold uppercase rounded-sm border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Terminate Message Log
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="mx-auto h-8 w-8 text-brand-neutral opacity-25">
                    <MessageSquare className="h-full w-full" />
                  </div>
                  <p className="font-serif italic text-xs text-brand-neutral">
                    Select an enquiry letter from the log to view details, update read status, or perform archive management actions.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
