
import React, { useState, useEffect } from 'react';
import { Donor } from '../types';
import { X } from 'lucide-react';

interface DonationFormProps {
  donor?: Donor;
  onSave: (donor: Donor) => void;
  onCancel: () => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({ donor, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Donor>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    isVolunteer: false,
    requestedSign: false,
    hasSign: false,
  });

  useEffect(() => {
    if (donor) {
      setFormData({
        ...donor,
        date: donor.date.split('T')[0]
      });
    }
  }, [donor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'amount' || name === 'age' ? Number(value) : value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || formData.amount === undefined) {
      alert("Please fill in required fields.");
      return;
    }
    
    const finalDonor: Donor = {
      id: donor?.id || crypto.randomUUID(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      amount: formData.amount || 0,
      date: formData.date || new Date().toISOString(),
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      city: formData.city || '',
      zip: formData.zip || '',
      age: formData.age,
      occupation: formData.occupation || '',
      notes: formData.notes || '',
      isVolunteer: !!formData.isVolunteer,
      requestedSign: !!formData.requestedSign,
      hasSign: !!formData.hasSign,
    };
    onSave(finalDonor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-sheriff-900 text-white">
          <div>
            <h2 className="text-xl font-bold">{donor ? 'Edit Supporter' : 'Log Contribution'}</h2>
            <p className="text-sheriff-200 text-sm">{donor ? 'Update existing supporter info' : 'Enter supporter details manually'}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Campaign Involvement Toggles */}
          {/* Personal Info */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Supporter Information</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" required className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.firstName || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input type="text" name="lastName" required className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.lastName || ''} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.email || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" name="phone" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.phone || ''} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input type="number" name="age" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.age || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input type="text" name="occupation" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.occupation || ''} />
                </div>
             </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Address</h3>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input type="text" name="address" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.address || ''} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" name="city" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.city || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                  <input type="text" name="zip" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sheriff-500 focus:ring-sheriff-500 sm:text-sm py-2 border px-3" onChange={handleChange} value={formData.zip || ''} />
                </div>
             </div>
          </div>

        </form>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sheriff-500">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-sheriff-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sheriff-500">
            {donor ? 'Update Supporter' : 'Save Supporter'}
          </button>
        </div>
      </div>
    </div>
  );
};
