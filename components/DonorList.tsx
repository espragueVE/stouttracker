
import React, { useState, useRef, useEffect } from 'react';
import { Donor } from '../types';
import { Search, Mail, Loader2, Filter, MoreVertical, Eye, X, MapPin, Briefcase, Calendar, Phone, AtSign, User } from 'lucide-react';

interface DonorListProps {
  donors: Donor[];
}

export const DonorList: React.FC<DonorListProps> = ({ donors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<{id: string, text: string} | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDonors = donors.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateNote = async (donor: Donor) => {
    setActiveDropdownId(null);
    setGeneratingId(donor.id);
    setGeneratedNote(null);
  };

  const handleViewDetails = (donor: Donor) => {
    setViewingDonor(donor);
    setActiveDropdownId(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Donation Records</h3>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search name or city..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sheriff-500 focus:border-sheriff-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredDonors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No donations found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredDonors.map((donor) => (
                <React.Fragment key={donor.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-sheriff-100 flex items-center justify-center text-sheriff-700 font-bold text-xs">
                          {donor.firstName[0]}{donor.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{donor.firstName} {donor.lastName}</div>
                          <div className="text-xs text-slate-500">{donor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">${donor.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{donor.city}</div>
                      <div className="text-xs text-slate-500">{donor.zip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(donor.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === donor.id ? null : donor.id)}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeDropdownId === donor.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 top-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-30 py-1 animate-in fade-in zoom-in duration-75 origin-top-right"
                        >
                          <button 
                            onClick={() => handleViewDetails(donor)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
                            View Profile
                          </button>
                          <button 
                            onClick={() => handleGenerateNote(donor)}
                            disabled={generatingId === donor.id}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                          >
                            {generatingId === donor.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-sheriff-600" />
                            ) : (
                              <Mail className="h-4 w-4 text-slate-400" />
                            )}
                            Thank You Note
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {generatedNote && generatedNote.id === donor.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-sheriff-50">
                        <div className="rounded-md bg-white border border-sheriff-200 p-4 shadow-sm relative">
                            <button 
                                onClick={() => setGeneratedNote(null)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" /> 
                            </button>
                            <h4 className="text-xs font-bold text-sheriff-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sheriff-500"></span>
                                Gemini AI Generated Draft
                            </h4>
                            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                {generatedNote.text}
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(generatedNote.text); alert("Copied to clipboard!");}}
                                    className="text-xs bg-sheriff-600 text-white px-3 py-1 rounded hover:bg-sheriff-700 font-medium"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Donor Detail Modal */}
      {viewingDonor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-sheriff-950 p-6 text-white relative">
              <button 
                onClick={() => setViewingDonor(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gold-500 flex items-center justify-center text-sheriff-950 font-black text-2xl shadow-lg">
                  {viewingDonor.firstName[0]}{viewingDonor.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{viewingDonor.firstName} {viewingDonor.lastName}</h2>
                  <p className="text-sheriff-400 text-sm font-medium">Contributor ID: {viewingDonor.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Total Contribution</p>
                  <p className="text-xl font-black text-emerald-600">${viewingDonor.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Donation Date</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(viewingDonor.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Contact & Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <AtSign className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingDonor.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingDonor.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingDonor.occupation || 'Occupation unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">Age: {viewingDonor.age || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Address</h3>
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-sheriff-500 mt-0.5" />
                  <div className="text-sm">
                    <p>{viewingDonor.address}</p>
                    <p>{viewingDonor.city}, {viewingDonor.zip}</p>
                  </div>
                </div>
              </div>

              {viewingDonor.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Internal Notes</h3>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-sm italic">
                    "{viewingDonor.notes}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewingDonor(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleGenerateNote(viewingDonor)}
                className="bg-sheriff-600 hover:bg-sheriff-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Draft Thank You
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
