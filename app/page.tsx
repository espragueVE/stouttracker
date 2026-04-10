"use client";
import React, { useState, useEffect } from "react";
import { Donor, ViewState, CampaignForm, LogEntry } from "./types/index";
import { DashboardStats } from "./components/DashboardStats";
import { DonationForm } from "./components/DonationForm";
import { SupportersList } from "./components/SupportersList";
import { FormsManager } from "./components/FormsManager";
import { LoginPage } from "./components/LoginPage";
import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { MonetaryDonationForm } from "./components/FormsManager";
import { InKindDonationForm } from "./components/FormsManager";
import { ExpendituresForm } from "./components/FormsManager";
import { LoansForm } from "./components/FormsManager";
import { ObligationsForm } from "./components/FormsManager";
import { LogPayload } from "./types/index";

// Mock initial data
const INITIAL_DONORS: Donor[] = [
  {
    id: "1",
    firstName: "Robert",
    lastName: "Vance",
    amount: 1500,
    date: "2023-10-01",
    email: "bob@vance.com",
    address: "123 Main St",
    city: "Scranton",
    zip: "18503",
    age: 54,
    occupation: "Business Owner",
    notes: "Concerned about downtown patrols",
    isVolunteer: true,
    requestedSign: false,
    hasSign: true,
  },
  {
    id: "2",
    firstName: "Phyllis",
    lastName: "Lapin",
    amount: 250,
    date: "2023-10-02",
    email: "phyllis@dunder.com",
    address: "45 Maple Ave",
    city: "Scranton",
    zip: "18503",
    age: 51,
    occupation: "Sales",
    notes: "",
    isVolunteer: false,
    requestedSign: true,
    hasSign: false,
  },
  {
    id: "3",
    firstName: "Stanley",
    lastName: "Hudson",
    amount: 50,
    date: "2023-10-05",
    email: "stanley@dunder.com",
    address: "89 Oak Ln",
    city: "Dunmore",
    zip: "18512",
    age: 62,
    occupation: "Sales",
    notes: "Sent via check",
    isVolunteer: false,
    requestedSign: false,
    hasSign: false,
  },
  {
    id: "4",
    firstName: "Michael",
    lastName: "Scott",
    amount: 500,
    date: "2023-10-06",
    email: "mscott@dunder.com",
    address: "12 Condominium Way",
    city: "Scranton",
    zip: "18503",
    age: 45,
    occupation: "Regional Manager",
    notes: "Wants a badge",
    isVolunteer: true,
    requestedSign: true,
    hasSign: true,
  },
  {
    id: "5",
    firstName: "Dwight",
    lastName: "Schrute",
    amount: 5000,
    date: "2023-10-07",
    email: "dwight@farms.com",
    address: "Schrute Farms",
    city: "Honesdale",
    zip: "18431",
    age: 40,
    occupation: "Farmer/Sheriff Deputy",
    notes: "Maximum donation allowed",
    isVolunteer: true,
    requestedSign: true,
    hasSign: true,
  },
  {
    id: "6",
    firstName: "Jim",
    lastName: "Halpert",
    amount: 100,
    date: "2023-10-08",
    email: "jim@athleap.com",
    address: "55 Willow Dr",
    city: "Philadelphia",
    zip: "19103",
    age: 35,
    occupation: "Marketing",
    notes: "",
    isVolunteer: false,
    requestedSign: true,
    hasSign: true,
  },
  {
    id: "7",
    firstName: "Pam",
    lastName: "Beesly",
    amount: 100,
    date: "2023-10-08",
    email: "pam@art.com",
    address: "55 Willow Dr",
    city: "Philadelphia",
    zip: "19103",
    age: 34,
    occupation: "Office Admin",
    notes: "",
    isVolunteer: false,
    requestedSign: false,
    hasSign: false,
  },
];

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // return localStorage.getItem('sheriff_auth') === 'true';
  });
  const [view, setView] = useState<ViewState>("dashboard");
  const [donors, setDonors] = useState<Donor[]>(() => {
    if (typeof window === "undefined") return INITIAL_DONORS;
    const saved = localStorage.getItem("sheriff_donors");
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });
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

  useEffect(() => {
    localStorage.setItem("sheriff_donors", JSON.stringify(donors));
    localStorage.setItem("sheriff_forms", JSON.stringify(forms));
    // localStorage.setItem('sheriff_auth', isLoggedIn.toString());
  }, [donors, forms, isLoggedIn]);

  // const handleLogin = () => {
  //   setIsLoggedIn(true);
  // };

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  //   setView('dashboard');
  // };

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

  // if (!isLoggedIn) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

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
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "dashboard" ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => setView("supporters")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "supporters" ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <Users className="h-5 w-5 mr-3" />
            Supporters
          </button>
          <button
            onClick={() => setView("log")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "log" ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            Log
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
            <button
              // onClick={handleLogout}
              className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-slate-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
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
            <button
              // onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {view === "dashboard" && <DashboardStats donors={donors} />}
          {view === "supporters" && (
            <SupportersList
              supporters={donors}
              onUpdateSupporter={handleUpdateSupporter}
              onEditSupporter={handleEditSupporter}
            />
          )}
          {view === "log" && (
            <FormsManager
              donors={donors}
              forms={forms}
              onSaveLogEntry={handleSaveLogEntry}
            />
          )}
        </div>
      </main>

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
