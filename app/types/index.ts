export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date';
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
  category: 'donation' | 'volunteer' | 'event' | 'note' | 'issue';
  createdBy: string;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  amount: number;
  date: string; // ISO string
  email: string;
  phone?: string;
  address: string;
  city: string;
  zip: string;
  age?: number;
  occupation?: string;
  notes?: string;
  isVolunteer?: boolean;
  requestedSign?: boolean;
  hasSign?: boolean;
}

export interface CampaignForm {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'finance' | 'outreach';
  FormQuestions: FormField[];
}

export interface CampaignStats {
  totalRaised: number;
  totalDonors: number;
  averageDonation: number;
  recentDonations: Donor[];
}

export type ViewState = 'dashboard' | 'supporters' | 'log';

// Volunteer interface for campaign staff management
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'onboarding' | 'inactive';
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
  status: 'pending' | 'delivered';
  requestDate: string; // ISO string
}

export interface LogPayload {
  id: string;
  formId: string;
  formTitle: string;
  // timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  answers: { [key: string]: string };
  };

