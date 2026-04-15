export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel" | "number" | "date";
  required: boolean;
}
export interface LogEntry {
  id: string;
  user?: Donor;
  formId: string;
  formAnswers: { [key: string]: string };
  date?: string;
  time?: string;
  description: string;
  category: "donation" | "volunteer" | "event" | "note" | "issue";
  createdBy: string;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  businessOrg?: string;
  email?: string;
  amount: number;
  date: string; // ISO string
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zip: string;
  age?: number;
  occupation?: string;
  employer?: string;
  notes?: string;
  isVolunteer?: boolean;
  requestedSign?: boolean;
  hasSign?: boolean;
}

export interface CampaignForm {
  id: string;
  title: string;
  description: string;
  category: "legal" | "finance" | "outreach";
  FormQuestions: FormField[];
}

export interface CampaignStats {
  totalRaised: number;
  totalDonors: number;
  averageDonation: number;
  recentDonations: Donor[];
}

export type ViewState = "dashboard" | "supporters" | "log";

// Volunteer interface for campaign staff management
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: "active" | "onboarding" | "inactive";
  interests: string[];
  joinedDate: string; // ISO string
}

// Added SignRequest interface to fix "Module '"../types"' has no exported member 'SignRequest'" error
export interface SignRequest {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  status: "pending" | "delivered";
  requestDate: string; // ISO string
}

export interface LogPayload {
  formId: string;
  formType: string;
  formTitle: string;
  // timestamp: string;
  user?: {
    id?: string;
    businessOrg?: string;
    middleName?: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    occupation?: string;
    employer?: string;
  };
  answers: { [key: string]: string };
}

// Shape returned by the dashboard API
export interface DashboardData {
  totalAmount: number;
  distinctDonors: Array<string | number>;
  avgAmount: number;
  topByDate: Array<{ Entry_Date?: string; EntryDate?: string; total: number }>;
  ages: {
    under30: number;
    between30and49: number;
    between50and64: number;
    over65: number;
  };
}
