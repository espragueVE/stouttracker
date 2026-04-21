export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel" | "number" | "date" | "bool";
  required: boolean;
}

export interface Amounts {
  id: number;
  amount: number;
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
export type  User = {
    id?: string;
    created_at?: string;
    Business_Org?: string;
    F_Name?: string;
    L_Name?: string;
    M_Name?: string;
    Address?: string;
    City?: string;
    State?: string;
    Zip?: string;
    Occupation?: string;
    Employer?: string;
    Age?: number;
    };

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
  distinctDonors: number;
  avgAmount: number;
  topByDate: Array<{ date: string; total: number }>;
  ages: {
    under30: number;
    between30and50: number;
    between51and64: number;
    over65: number;
  };
}
