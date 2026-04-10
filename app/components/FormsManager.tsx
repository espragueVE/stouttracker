"use client";

import React, { useState } from "react";
import { CampaignForm, Donor, FormField } from "../types";
import { ClipboardList, FileSignature, ChevronRight, X } from "lucide-react";
import { time } from "console";

interface FormsManagerProps {
  forms: CampaignForm[];
  donors: Donor[];
  onSaveLogEntry: (entry: any) => void;
  formFields?: { [formId: string]: FormField[] };
}

export const MonetaryDonationForm: FormField[] = [
  {
    id: "AmountDonated",
    label: "Amount Donated",
    type: "number",
    required: true,
  },
  { id: "ReceivedFor", label: "Received For", type: "text", required: true },
  { id: "DateReceived", label: "Date Received", type: "date", required: true },
];

export const InKindDonationForm: FormField[] = [
  { id: "ReceivedFor", label: "Received For", type: "text", required: true },
  { id: "Value", label: "Estimated Value", type: "number", required: true },
  { id: "DateReceived", label: "Date Received", type: "date", required: true },
];

export const ExpendituresForm: FormField[] = [
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
    id: "OutstandingBalanceStart",
    label: "Outstanding Balance Start",
    type: "number",
    required: true,
  },
  {
    id: "LoansReceived",
    label: "Loans Received",
    type: "number",
    required: true,
  },
  {
    id: "LoanPayments",
    label: "Loan Payments Made",
    type: "number",
    required: true,
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
  f1: MonetaryDonationForm,
  f2: InKindDonationForm,
  f3: ExpendituresForm,
  f4: LoansForm,
  f5: ObligationsForm,
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
  const [isNewUser, setIsNewUser] = useState(false);
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
      selectedForm.FormQuestions ||
      formFields[selectedForm.id] ||
      PRESET_FORMS[selectedForm.id] ||
      DEFAULT_FIELDS;
  }

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

        {/* Empty State / Custom Builder placeholder */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
          <div className="p-4 bg-white rounded-full shadow-sm">
            <FileSignature className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600">
              Custom Form Builder
            </p>
            <p className="text-xs text-slate-500">
              Create specialized tracking logs
            </p>
          </div>
          <button className="text-xs bg-white border border-slate-300 px-4 py-2 rounded-lg font-bold text-slate-700 shadow-sm hover:bg-slate-100 hover:border-slate-400 transition-colors">
            Configure Editor
          </button>
        </div>
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
                onClick={() => setIsLogFormOpen(false)}
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
                      value={selectedDonor?.id || ""}
                      onChange={(e) => {
                        const donor = donors.find(
                          (d) => d.id === e.target.value,
                        );
                        setSelectedDonor(donor || null);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium bg-white"
                    >
                      <option value="">
                        Choose from existing participants...
                      </option>
                      {donors.map((donor) => (
                        <option key={donor.id} value={donor.id}>
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
                        placeholder="State"
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
                        type="text"
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
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsLogFormOpen(false)}
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
    </div>
  );
};
