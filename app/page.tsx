"use client";
import React, { useState, useEffect } from "react";
import {
  Donor,
  ViewState,
  CampaignForm,
  LogEntry,
  DashboardData,
} from "./types/index";
import { DashboardStats } from "./components/DashboardStats";
import { DonationForm } from "./components/DonationForm";
import { SupportersList } from "./components/SupportersList";
import { FormsManager } from "./components/FormsManager";
import { LoginPage } from "./components/LoginPage";
import { AllLogsTable } from "./components/AllLogsTable";
import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardList,
  LogOut,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  X,
  Lock,
} from "lucide-react";
import { MonetaryDonationForm } from "./components/FormsManager";
import { InKindDonationForm } from "./components/FormsManager";
import { ExpendituresForm } from "./components/FormsManager";
import { LoansForm } from "./components/FormsManager";
import { ObligationsForm } from "./components/FormsManager";
import { LogPayload } from "./types/index";

// Mock initial data


const INITIAL_FORMS: CampaignForm[] = [
  {
    id: "MonetaryContributions",
    title: "Itemized Statement of Contributions",
    description:
      "Detailed record of all monetary donations received for election reporting.",
    category: "finance",
    FormQuestions: MonetaryDonationForm,
  },
  {
    id: "InKindContributions",
    title: "Itemized Statement of In-Kind Contributions",
    description:
      "Report of non-monetary goods or services provided to the campaign.",
    category: "finance",
    FormQuestions: InKindDonationForm,
  },
  {
    id: "Expenditures",
    title: "Itemized Statement of Expenditures",
    description:
      "Log of campaign spending including vendor payments and reimbursements.",
    category: "finance",
    FormQuestions: ExpendituresForm,
  },
  {
    id: "Loans",
    title: "Itemized Statement of Loans",
    description:
      "Record of funds borrowed by the campaign from individuals or lending institutions.",
    category: "finance",
    FormQuestions: LoansForm,
  },
  {
    id: "Obligations",
    title: "Itemized Statement of Obligations",
    description:
      "Listing of outstanding debts and obligations owed by the campaign.",
    category: "finance",
    FormQuestions: ObligationsForm,
  },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("sheriff_auth") === "true";
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [view, setView] = useState<ViewState>("dashboard");

  const [donors, setDonors] = useState<Donor[]>([]);  
  const [forms, setForms] = useState<CampaignForm[]>(() => {
    if (typeof window === "undefined") return INITIAL_FORMS;
    const saved = localStorage.getItem("sheriff_forms");
    const initial = saved ? JSON.parse(saved) : INITIAL_FORMS;
    if (!saved || initial.length < 5) return INITIAL_FORMS;
    return initial;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | undefined>(
    undefined,
  );
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("sheriff_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/GetUsers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Donor[] = await res.json();
      setDonors(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadDashboardData = async () => {
    try {
      const res = await fetch("/api/DashInfo");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashboardData = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadUsers();
  }, [isLoggedIn]);

  // Fetch dashboard aggregates from server API
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/DashInfo");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DashboardData = await res.json();
        if (mounted) setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const handleEntriesChanged = async () => {
    await loadDashboardData();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    localStorage.setItem("sheriff_auth", "true");
  };

  const handleOpenCreateUser = () => {
    setIsLoginOpen(false);
    setCreateUserError("");
    setCreateUserSuccess("");
    setIsCreateUserOpen(true);
  };

  const handleCloseCreateUser = () => {
    setIsCreateUserOpen(false);
    setCreateUserError("");
    setCreateUserSuccess("");
    setCreateUserEmail("");
    setCreateUserPassword("");
    setShowCreatePassword(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLoginOpen(false);
    setIsCreateUserOpen(false);
    setView("dashboard");
    localStorage.removeItem("sheriff_auth");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");

    if (!createUserEmail.trim() || !createUserPassword.trim()) {
      setCreateUserError("Email and password are required.");
      return;
    }

    try {
      setIsCreatingUser(true);

      const response = await fetch("/api/CreateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createUserEmail,
          password: createUserPassword,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setCreateUserSuccess("User created. You can now sign in.");
    } catch (error) {
      setCreateUserError(
        error instanceof Error ? error.message : "Failed to create user.",
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleSaveDonor = (donorData: Donor) => {
    if (editingDonor) {
      setDonors((prev) =>
        prev.map((d) => (d.id === donorData.id ? donorData : d)),
      );
    } else {
      setDonors((prev) => [donorData, ...prev]);
    }
    setIsFormOpen(false);
    setEditingDonor(undefined);
  };

  const handleUpdateSupporter = (updatedDonor: Donor) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === updatedDonor.id ? updatedDonor : d)),
    );
  };

  const handleEditSupporter = (donor: Donor) => {
    setEditingDonor(donor);
    setIsFormOpen(true);
  };

  const handleSaveLogEntry = async (entry: LogEntry) => {
    try {
      // Create payload for API submission
      const payload: LogPayload = {
        formId: entry.id,
        formType: entry.formId,
        formTitle:
          forms.find((f) => f.id === entry.formId)?.title || "Unknown Form",
        user: entry.user
          ? {
              id: entry.user.id?.toString() || "",
              firstName: entry.user.firstName,
              lastName: entry.user.lastName,
              businessOrg: entry.user.businessOrg,
              middleName: entry.user.middleName,
              address: entry.user.address,
              city: entry.user.city,
              state: entry.user.state,
              zip: entry.user.zip,
              occupation: entry.user.occupation,
              employer: entry.user.employer,
              age: entry.user.age,
            }
          : undefined,
        answers: entry.formAnswers,
      };

      // Submit to API
      try {
        const response = await fetch("/api/PostEntry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), // Send payload directly, not wrapped
        });
        if (response.ok) {
          setLogEntries((prev) => [entry, ...prev]);
          localStorage.setItem(
            "sheriff_logs",
            JSON.stringify([entry, ...logEntries]),
          );
        } else {
          console.error("Failed to save log entry");
        }
      } catch (error) {
        console.error("Error saving log entry:", error);
      }
    } catch (error) {
      console.error("Error in handleSaveLogEntry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Shield className="h-8 w-8 text-amber-500 mr-3" />
          <div className="leading-tight">
            <h1 className="font-bold text-lg tracking-wide">SHERIFF</h1>
            <span className="text-xs text-slate-400 uppercase tracking-widest">
              Command Center
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => isLoggedIn && setView("dashboard")}
            disabled={!isLoggedIn}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "dashboard" && isLoggedIn ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isLoggedIn ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-300" : ""}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => isLoggedIn && setView("supporters")}
            disabled={!isLoggedIn}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "supporters" && isLoggedIn ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isLoggedIn ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-300" : ""}`}
          >
            <Users className="h-5 w-5 mr-3" />
            Supporters
          </button>
          <button
            onClick={() => isLoggedIn && setView("log")}
            disabled={!isLoggedIn}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "log" && isLoggedIn ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isLoggedIn ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-300" : ""}`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            Log
          </button>
          <button
            onClick={() => isLoggedIn && setView("entries")}
            disabled={!isLoggedIn}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "entries" && isLoggedIn ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isLoggedIn ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-300" : ""}`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            All Entries
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 group-hover:border-amber-500 transition-colors">
                <span className="text-xs font-bold text-amber-500">CM</span>
              </div>
              <div className="text-sm">
                <p className="font-bold text-white">Campaign Mgr</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                  Active Session
                </p>
              </div>
            </div>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-slate-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-colors text-slate-400"
                title="Log in"
              >
                <LogIn className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="md:hidden flex items-center text-sheriff-900 font-bold">
            <Shield className="h-6 w-6 text-gold-500 mr-2" />
            Sheriff Command
          </div>
          <h2 className="hidden md:block text-xl font-bold text-slate-800 capitalize">
            {view === "dashboard" ? "Campaign Overview" : `${view} Management`}
          </h2>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Campaign Phase
              </span>
              <span className="text-xs font-bold text-sheriff-700">
                Primary Election
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Log In</span>
              </button>
            )}
          </div>
        </header>

        {/* View Container */}
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {!isLoggedIn ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Login Required</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  You must be logged in before you can access the dashboard,
                  forms, supporters, or entries.
                </p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <LogIn className="h-4 w-4" />
                  Log In
                </button>
              </div>
            </div>
          ) : (
            <>
              {view === "dashboard" && (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={handleOpenCreateUser}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create User
                    </button>
                  </div>
                  <DashboardStats donors={donors} dashboardData={dashboardData} />
                </>
              )}
              {view === "supporters" && (
                <SupportersList
                  supporters={donors}
                  onUpdateSupporter={handleUpdateSupporter}
                  onEditSupporter={handleEditSupporter}
                />
              )}
              {view === "log" && (
                <>
                  <FormsManager
                    donors={donors}
                    forms={forms}
                    onSaveLogEntry={handleSaveLogEntry}
                  />

                </>
              )}
              {view === "entries" && (
                <AllLogsTable onEntriesChanged={handleEntriesChanged} />
              )}
            </>
          )}
        </div>
      </main>

      {isLoginOpen && !isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
          <LoginPage
            onLogin={handleLogin}
            onClose={() => setIsLoginOpen(false)}
            standalone={false}
          />
        </div>
      )}

      {isCreateUserOpen && !isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="p-8">
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseCreateUser}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close create user"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-800 text-center">
                  Create User
                </h2>
                <p className="mb-8 mt-2 text-center text-sm text-slate-500">
                  Create a new login for the dashboard.
                </p>

                <form onSubmit={handleCreateUser} className="space-y-5">
                  {createUserError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
                      {createUserError}
                    </div>
                  )}

                  {createUserSuccess && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                      {createUserSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <UserPlus className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={createUserEmail}
                        onChange={(event) => setCreateUserEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-black transition-all placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showCreatePassword ? "text" : "password"}
                        required
                        value={createUserPassword}
                        onChange={(event) => setCreateUserPassword(event.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-black transition-all placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword((current) => !current)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showCreatePassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCreatingUser ? (
                      <>
                        <LogIn className="h-4 w-4 animate-pulse" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create User
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <DonationForm
          donor={editingDonor}
          onSave={handleSaveDonor}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingDonor(undefined);
          }}
        />
      )}
    </div>
  );
};

export default App;
