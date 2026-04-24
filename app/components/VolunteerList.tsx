
import React, { useState } from 'react';
import { Volunteer } from '../types';
import { formatDate } from '../lib/dateUtils';
import { UserPlus, Search,  Mail, MoreVertical } from 'lucide-react';

interface VolunteerListProps {
  volunteers: Volunteer[];
  onAdd: () => void;
}

export const VolunteerList: React.FC<VolunteerListProps> = ({ volunteers, onAdd }) => {
  const [search, setSearch] = useState('');

  const filtered = volunteers.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.interests.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Campaign Volunteers</h2>
          <p className="text-slate-500">Manage boots on the ground</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-sheriff-600 hover:bg-sheriff-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Add Volunteer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or skill..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sheriff-500 focus:border-sheriff-500 outline-none"
              value={search}
              // Fixed: Ensure the search state is updated with the event value
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-sheriff-100 flex items-center justify-center text-sheriff-700 font-bold">
                        {v.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{v.name}</div>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {v.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.status === 'active' ? 'bg-green-100 text-green-800' : 
                      v.status === 'onboarding' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {v.interests.map((interest, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(v.joinedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
