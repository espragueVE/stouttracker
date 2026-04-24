"use client";

import React, { useState } from "react";
import { CampaignForm, Donor, FormField } from "../types";
import { ClipboardList, FileSignature, ChevronRight, X } from "lucide-react";
import { ReportPDF } from "./ReportComponents/ReportPDF";
import Swal from "sweetalert2";

interface FormsManagerProps {
  forms: CampaignForm[];
  donors: Donor[];
  onSaveLogEntry: (entry: any) => void;
  formFields?: { [formId: string]: FormField[] };
}

type ReportData = {
  startDate?: string;
  endDate?: string;
  monetaryDonations?: Array<{
    id?: string | number;
    amount?: number;
    date?: string | null;
    aggregate?: number | string | null;
    received_for?: string | null;
    prefers_anonymous?: boolean | null;
    entry?: {
      user?: {
        Business_Org?: string | null;
        F_Name?: string | null;
        M_Name?: string | null;
        L_Name?: string | null;
        Address?: string | null;
        City?: string | null;
        State?: string | null;
        Zip?: string | null;
        Occupation?: string | null;
        Employer?: string | null;
      } | null;
    } | null;
  }>;
  inKindDonations?: Array<{
    id?: string | number;
    value?: number | string | null;
    date?: string | null;
    aggregate?: number | string | null;
    received_for?: string | null;
    description?: string | null;
    entry?: {
      user?: {
        Business_Org?: string | null;
        F_Name?: string | null;
        M_Name?: string | null;
        L_Name?: string | null;
        Address?: string | null;
        City?: string | null;
        State?: string | null;
        Zip?: string | null;
        Occupation?: string | null;
        Employer?: string | null;
      } | null;
    } | null;
  }>;
  expenditures?: Array<{
    id?: string | number;
    amount?: number | string | null;
    date?: string | null;
    purpose?: string | null;
    entry?: {
      user?: {
        Business_Org?: string | null;
        F_Name?: string | null;
        M_Name?: string | null;
        L_Name?: string | null;
        Address?: string | null;
        City?: string | null;
        State?: string | null;
        Zip?: string | null;
        Occupation?: string | null;
        Employer?: string | null;
      } | null;
    } | null;
  }>;
  loans?: Array<{
    id?: string | number;
    date?: string | null;
    outstanding_start?: number | string | null;
    recieved?: number | string | null;
    received?: number | string | null;
    payment?: number | string | null;
    payments?: number | string | null;
    outstanding_end?: number | string | null;
    received_for?: string | null;
    recieved_for?: string | null;
    endorser_Fname1?: string | null;
    endorser_Mname1?: string | null;
    endorser_Lname1?: string | null;
    endorser_Address1?: string | null;
    endorser_City1?: string | null;
    endorser_State1?: string | null;
    endorser_Zip1?: string | null;
    amount_outstanding1?: number | string | null;
    endorser_Fname2?: string | null;
    endorser_Mname2?: string | null;
    endorser_Lname2?: string | null;
    endorser_Address2?: string | null;
    endorser_City2?: string | null;
    endorser_State2?: string | null;
    endorser_Zip2?: string | null;
    amount_outstanding2?: number | string | null;
    endorser_Fname3?: string | null;
    endorser_Mname3?: string | null;
    endorser_Lname3?: string | null;
    endorser_Address3?: string | null;
    endorser_City3?: string | null;
    endorser_State3?: string | null;
    endorser_Zip3?: string | null;
    amount_outstanding3?: number | string | null;
    entry?: {
      user?: {
        Business_Org?: string | null;
        F_Name?: string | null;
        M_Name?: string | null;
        L_Name?: string | null;
        Address?: string | null;
        City?: string | null;
        State?: string | null;
        Zip?: string | null;
        Occupation?: string | null;
        Employer?: string | null;
      } | null;
    } | null;
  }>;
  obligations?: Array<{
    id?: string | number;
    description?: string | null;
    outstanding_start?: number | string | null;
    debt_incurred?: number | string | null;
    payments?: number | string | null;
    outstanding_end?: number | string | null;
    entry?: {
      user?: {
        Business_Org?: string | null;
        F_Name?: string | null;
        M_Name?: string | null;
        L_Name?: string | null;
        Address?: string | null;
        City?: string | null;
        State?: string | null;
        Zip?: string | null;
        Occupation?: string | null;
        Employer?: string | null;
      } | null;
    } | null;
  }>;
};

export const MonetaryDonationForm: FormField[] = [
    {
    id: "ElectionCycle",
    label: "Election Cycle",
    type: "dropdown",
    required: true,
  },
  {
    id: "AmountDonated",
    label: "Amount Donated",
    type: "number",
    required: true,
  },
  { id: "ReceivedFor", label: "Received For", type: "text", required: true },
  { id: "DateReceived", label: "Date Received", type: "date", required: true },
  { id: "Anonymous", label: "Prefers Anonymously?", type: "bool", required: false },
];

export const InKindDonationForm: FormField[] = [
    {
    id: "ElectionCycle",
    label: "Election Cycle",
    type: "dropdown",
    required: true,
  },
  { id: "ReceivedFor", label: "Received For", type: "text", required: true },
  { id: "Value", label: "Estimated Value", type: "number", required: true },
  { id: "DateReceived", label: "Date Received", type: "date", required: true },
];

export const ExpendituresForm: FormField[] = [
    {
    id: "ElectionCycle",
    label: "Election Cycle",
    type: "dropdown",
    required: true,
  },
  { id: "Amount", label: "Amount Spent", type: "number", required: true },
  {
    id: "Purpose",
    label: "Purpose of Expenditure",
    type: "text",
    required: true,
  },
  { id: "Date", label: "Date of Expenditure", type: "date", required: true },
];

export const LoansForm: FormField[] = [
    {
    id: "ElectionCycle",
    label: "Election Cycle",
    type: "dropdown",
    required: true,
  },
  {
    id: "OutstandingBalanceStart",
    label: "Outstanding Balance Start",
    type: "number",
    required: true,
  },
  {
    id: "LoansReceived",
    label: "Loans Received Amount $",
    type: "number",
    required: true,
  },
  {
    id: "LoanPayments",
    label: "Loan Payments Made $",
    type: "number",
    required: true,
  },
  {
    id: "EndorserFName1",
    label: "Endorser 1 First Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserMName1",
    label: "Endorser 1 Middle Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserLName1",
    label: "Endorser 1 Last Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserAddress1",
    label: "Endorser 1 Address",
    type: "text",
    required: false,
  },
  {
    id: "EndorserCity1",
    label: "Endorser 1 City",
    type: "text",
    required: false,
  },
  {
    id: "EndorserState1",
    label: "Endorser 1 State",
    type: "state",
    required: false,
  },
  {
    id: "EndorserZip1",
    label: "Endorser 1 Zip",
    type: "zip",
    required: false,
  },
    {
      id: "AmountOutstanding1",
      label: "Amount Outstanding for Endorser 1",
      type: "number",
      required: false,
    },
      {
    id: "EndorserFName2",
    label: "Endorser 2 First Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserMName2",
    label: "Endorser 2 Middle Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserLName2",
    label: "Endorser 2 Last Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserAddress2",
    label: "Endorser 2 Address",
    type: "text",
    required: false,
  },
  {
    id: "EndorserCity2",
    label: "Endorser 2 City",
    type: "text",
    required: false,
  },
  {
    id: "EndorserState2",
    label: "Endorser 2 State",
    type: "state",
    required: false,
  },
  {
    id: "EndorserZip2",
    label: "Endorser 2 Zip",
    type: "zip",
    required: false,
  },
    { id: "AmountOutstanding2",
       label: "Amount Outstanding for Endorser 2",
        type: "number",
         required: false
         },
  {
    id: "EndorserFName3",
    label: "Endorser 3 First Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserMName3",
    label: "Endorser 3 Middle Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserLName3",
    label: "Endorser 3 Last Name",
    type: "text",
    required: false,
  },
  {
    id: "EndorserAddress3",
    label: "Endorser 3 Address",
    type: "text",
    required: false,
  },
  {
    id: "EndorserCity3",
    label: "Endorser 3 City",
    type: "text",
    required: false,
  },
  {
    id: "EndorserState3",
    label: "Endorser 3 State",
    type: "state",
    required: false,
  },
  {
    id: "EndorserZip3",
    label: "Endorser 3 Zip",
    type: "zip",
    required: false,
  },
  {
    id: "AmountOutstanding3",
    label: "Amount Outstanding for Endorser 3",
    type: "number",
    required: false,
  },

  {
    id: "OutstandingBalanceEnd",
    label: "Outstanding Balance End",
    type: "number",
    required: true,
  },
  { id: "ReceivedFor", label: "Received For", type: "text", required: true },
  { id: "Date", label: "Date of Report", type: "date", required: true },
];

export const ObligationsForm: FormField[] = [
  {
    id: "ElectionCycle",
    label: "Election Cycle",
    type: "dropdown",
    required: true,
  },
  {
    id: "Description",
    label: "Description of Obligation",
    type: "text",
    required: true,
  },
  {
    id: "OutstandingBalanceStart",
    label: "Outstanding Balance Start",
    type: "number",
    required: true,
  },
  {
    id: "DebtIncurred",
    label: "Debt Incurred",
    type: "number",
    required: true,
  },
  {
    id: "DebtPayments",
    label: "Debt Payments Made",
    type: "number",
    required: true,
  },
  {
    id: "OutstandingBalanceEnd",
    label: "Outstanding Balance End",
    type: "number",
    required: true,
  },
];

const DEFAULT_FIELDS: FormField[] = [
  { id: "q1", label: "Question 1", type: "textarea", required: true },
  { id: "q2", label: "Question 2", type: "textarea", required: true },
  { id: "q3", label: "Question 3", type: "textarea", required: true },
];

// Preset mapping for forms that may have lost their `FormQuestions` when
// persisted or loaded from localStorage.
const PRESET_FORMS: { [formId: string]: FormField[] } = {
  MonetaryContributions: MonetaryDonationForm,
  InKindContributions: InKindDonationForm,
  Expenditures: ExpendituresForm,
  Loans: LoansForm,
  Obligations: ObligationsForm,
};

export const FormsManager: React.FC<FormsManagerProps> = ({
  forms,
  donors,
  onSaveLogEntry,
  formFields = {},
}) => {
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showNewEndorserFields, setShowNewEndorserFields] = useState(false);
  const [newUserData, setNewUserData] = useState({
    businessOrg: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    occupation: "",
    employer: "",
    age: "",
  });
  const [formAnswers, setFormAnswers] = useState<{ [key: string]: string }>({});

  const handleOpenLogForm = (formId: string) => {
    setSelectedFormId(formId);
    setIsLogFormOpen(true);
    setSelectedDonor(null);
    setIsNewUser(false);
    setFormAnswers({});
  };

  const handleSaveEntry = () => {
    const user = isNewUser ? newUserData : selectedDonor;
    if (!user || !selectedFormId || Object.keys(formAnswers).length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    const checkZipFormat = Object.entries(formAnswers).find(([key, value]) => key.toLowerCase().includes("zip") && value.length > 0 && !/^\d{5}$/.test(value));
    if (checkZipFormat) {
      Swal.fire({
        icon: "error",
        title: "Invalid ZIP Code",
        text: "Please enter a valid 5-digit ZIP code.",
      });
      return;
    }


    const entry = {
      id: Date.now().toString(),
      formId: selectedFormId,
      user,
      formAnswers: formAnswers, // Changed from 'answers' to 'formAnswers'
    };

    onSaveLogEntry(entry);
    setIsLogFormOpen(false);
    setSelectedFormId(null);
    setSelectedDonor(null);
    setNewUserData({
      businessOrg: "",
      firstName: "",
      middleName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      occupation: "",
      employer: "",
      age: "",
    });
    setFormAnswers({});
  };

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  let currentFields: FormField[] = DEFAULT_FIELDS;

  if (selectedForm) {
    currentFields =
      PRESET_FORMS[selectedForm.id] ||
      formFields[selectedForm.id] ||
      selectedForm.FormQuestions ||
      DEFAULT_FIELDS;
  }
  const [currentLoanMessage, setCurrentLoanMessage] = useState("Show Additional Endorser Fields +");

  const getDonorId = (donor: Donor | null) => String(donor?.id ?? "");

  const handleShowMoreClick = () => {
    if (showNewEndorserFields) {
      setShowNewEndorserFields(false);
      setCurrentLoanMessage("Show Additional Endorser Fields +");
      return currentLoanMessage;
    }
    if (!showNewEndorserFields) {
    setShowNewEndorserFields(true);
     setCurrentLoanMessage("Hide Additional Endorser Fields -");
    return currentLoanMessage;
  }
};

  const handleCreateReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      setReportMessage("Select both a start date and an end date.");
      return;
    }

    setIsCreatingReport(true);
    setReportMessage(null);

    try {
      const response = await fetch("/api/GetReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: reportStartDate,
          endDate: reportEndDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReportMessage(data.error || "Failed to create report.");
        return;
      }

      setReportData(data as ReportData);
      setIsReportPreviewOpen(true);
      setReportMessage("Report created. Use Print to save as PDF.");
    } catch (error) {
      console.error("Create report error:", error);
      setReportMessage("Failed to create report.");
    } finally {
      setIsCreatingReport(false);
    }
  };

  const checkIfShown = (label: string) => {
    if(!showNewEndorserFields && label.includes("Endorser") && !label.includes("1")){
      return false;
    }   
     return label;
  };
   
  

  const renderFormField = (field: FormField) => {
    const value = formAnswers[field.id] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            key={field.id}
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter your response..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-slate-900"
          />
        );
      case "email":
        return (
          <input
            key={field.id}
            type="email"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter email address..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
        case "zip":
        return (
          <input
            key={field.id}
            type="number"
            value={value}
            maxLength={5}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter ZIP code..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
        case "dropdown":
        return (
          <select
            key={field.id}
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          >
            <option value="">Select election cycle...</option>
            <option value="primary">Primary Election</option>
            <option value="general">General Election</option>
            <option value="runoff">Runoff (Local Elections Only)</option>
          </select>
        );
      case "tel":
        return (
          <input
            key={field.id}
            type="tel"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter phone number..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
      case "number":
        return (
          <input
            key={field.id}
            type="number"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter a number..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
      case "date":
        return (
          <input
            key={field.id}
            type="date"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
        case "state":
        return (
          <input
            key={field.id}
            type="text"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter state abbreviation (e.g. CA)..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
      case "bool":
        return (
          <div key={field.id} className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-slate-900">
              <input
                type="checkbox"
                checked={value === "true"}
                onChange={(e) =>
                  setFormAnswers({
                    ...formAnswers,
                    [field.id]: e.target.checked ? "true" : "false",
                  })
                }
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              {field.label}
            </label>
          </div>
        );
      case "text":
      default:
        return (
          <input
            key={field.id}
            type="text"
            value={value}
            onChange={(e) =>
              setFormAnswers({ ...formAnswers, [field.id]: e.target.value })
            }
            placeholder="Enter text..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">
            Campaign Documentation
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Log activities and fill out required reporting forms
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-blue-700" />
              Create Report
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Generate a report for a selected date range.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:items-end">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                End Date
              </label>
              <input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>

            <button
              onClick={handleCreateReport}
              disabled={isCreatingReport}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreatingReport ? "Creating..." : "Create Report"}
            </button>
          </div>
        </div>

        {reportMessage && (
          <p className="text-sm text-slate-600 mt-4">{reportMessage}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow group"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ClipboardList className="h-6 w-6" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {form.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                {form.description}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
              <button
                onClick={() => handleOpenLogForm(form.id)}
                className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm"
              >
                Log Entry
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Log Entry Modal */}
      {isLogFormOpen && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedForm.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
                  New Log Entry
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLogFormOpen(false);
                }}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Selection */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 uppercase text-sm tracking-wide">
                  Select Participant
                </h4>

                {!isNewUser ? (
                  <div className="space-y-3">
                    <select
                      value={getDonorId(selectedDonor)}
                      onChange={(e) => {
                        const donor = donors.find(
                          (d) => String(d.id) === e.target.value,
                        );
                        setSelectedDonor(donor || null);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium bg-white"
                    >
                      <option value="">
                        Choose from existing participants...
                      </option>
                      {donors.map((donor) => (
                        <option key={String(donor.id)} value={String(donor.id)}>
                          {donor.firstName}{" "}
                          {donor.middleName ? donor.middleName + " " : ""}
                          {donor.lastName}
                          {donor.businessOrg
                            ? ` — ${donor.businessOrg}`
                            : ""} • {donor.city}
                          {donor.state ? `, ${donor.state}` : ""} {donor.zip}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsNewUser(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                    >
                      + Add New Participant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="text"
                      placeholder="Business / Organization (if applicable)"
                      value={newUserData.businessOrg}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          businessOrg: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={newUserData.firstName}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Middle Name"
                        value={newUserData.middleName}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            middleName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newUserData.lastName}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={newUserData.address}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={newUserData.city}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="State (e.g. CA)"
                        value={newUserData.state}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Zip"
                        value={newUserData.zip}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            zip: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Occupation"
                        value={newUserData.occupation}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            occupation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Employer"
                        value={newUserData.employer}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            employer: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Age"
                      value={newUserData.age}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, age: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                    <button
                      onClick={() => setIsNewUser(false)}
                      className="text-sm text-slate-600 hover:text-slate-700 font-bold transition-colors"
                    >
                      ← Back to Existing Participants
                    </button>
                  </div>
                )}
              </div>

              {/* Form Questions - Dynamic Fields */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 uppercase text-sm tracking-wide">
                  Required Information
                </h4>
                <div className="space-y-4">
                  {currentFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        {checkIfShown(field.label) && field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                       {checkIfShown(field.label) && renderFormField(field)}
                       {field.label === "Amount Outstanding for Endorser 1" && (
                        <button
                          onClick={() => handleShowMoreClick()}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                        >
                          {currentLoanMessage}
                        </button>
                        
                       )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => { setShowNewEndorserFields(false); setIsLogFormOpen(false); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 px-4 py-2.5 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors active:scale-[0.98]"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReportPDF
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        reportData={reportData}
      />
    </div>
  );
};
