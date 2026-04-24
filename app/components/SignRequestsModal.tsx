
import React from 'react';
import { SignRequest } from '../types';
import { formatDate } from '../lib/dateUtils';
import { X, MapPin, CheckCircle2, Clock } from 'lucide-react';

interface SignRequestsModalProps {
  requests: SignRequest[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'pending' | 'delivered') => void;
}

export const SignRequestsModal: React.FC<SignRequestsModalProps> = ({ requests, onClose, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-sheriff-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold-400" />
            <h2 className="text-xl font-bold">Campaign Sign Requests</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No sign requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{req.name}</div>
                      <div className="text-xs text-slate-500">{formatDate(req.requestDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{req.address}</div>
                      <div className="text-xs text-slate-400">{req.city}, {req.zip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === 'delivered' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onUpdateStatus(req.id, req.status === 'delivered' ? 'pending' : 'delivered')}
                        className="text-sheriff-600 hover:text-sheriff-900"
                      >
                        Mark {req.status === 'delivered' ? 'Pending' : 'Delivered'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
          <p className="text-xs text-slate-500">{requests.filter(r => r.status === 'pending').length} pending deliveries</p>
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
