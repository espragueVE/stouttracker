
import React, { useState, useRef, useEffect } from 'react';
import { Donor } from '../types';
import { Search, Mail, Loader2, Filter, MoreVertical, Eye, X, MapPin, Briefcase, Calendar, Phone, AtSign, User, Edit2, CheckSquare, Square } from 'lucide-react';

interface SupportersListProps {
  supporters: Donor[];
  onUpdateSupporter?: (supporter: Donor) => void;
  onEditSupporter?: (supporter: Donor) => void;
}

export const SupportersList: React.FC<SupportersListProps> = ({ supporters, onUpdateSupporter, onEditSupporter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVolunteer, setFilterVolunteer] = useState(false);
  const [filterRequestedSign, setFilterRequestedSign] = useState(false);
  
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<{id: string, text: string} | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewingSupporter, setViewingSupporter] = useState<Donor | null>(null);
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

  const filteredSupporters = supporters.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVolunteer = !filterVolunteer || s.isVolunteer;
    const matchesRequestedSign = !filterRequestedSign || s.requestedSign;

    return matchesSearch && matchesVolunteer && matchesRequestedSign;
  });

  const handleGenerateNote = async (supporter: Donor) => {
    setActiveDropdownId(null);
    setGeneratingId(supporter.id);
    setGeneratedNote(null);
  };

  const handleViewDetails = (supporter: Donor) => {
    setViewingSupporter(supporter);
    setActiveDropdownId(null);
  };

  const handleToggle = (supporter: Donor, field: 'isVolunteer' | 'requestedSign' | 'hasSign') => {
    if (onUpdateSupporter) {
      onUpdateSupporter({
        ...supporter,
        [field]: !supporter[field]
      });
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Campaign Supporters</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Quick Filters:</span>
            <label className="flex items-center gap-1.5 cursor-pointer group select-none">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={filterVolunteer} 
                onChange={() => setFilterVolunteer(!filterVolunteer)} 
              />
              {filterVolunteer ? (
                <CheckSquare className="h-4 w-4 text-sheriff-600" />
              ) : (
                <Square className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
              )}
              <span className={`text-xs font-medium ${filterVolunteer ? 'text-sheriff-700' : 'text-slate-500'}`}>Volunteers</span>
            </label>
            
            <div className="w-px h-4 bg-slate-200"></div>

            <label className="flex items-center gap-1.5 cursor-pointer group select-none">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={filterRequestedSign} 
                onChange={() => setFilterRequestedSign(!filterRequestedSign)} 
              />
              {filterRequestedSign ? (
                <CheckSquare className="h-4 w-4 text-sheriff-600" />
              ) : (
                <Square className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
              )}
              <span className={`text-xs font-medium ${filterRequestedSign ? 'text-sheriff-700' : 'text-slate-500'}`}>Sign Requests</span>
            </label>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search name or city..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sheriff-500 focus:border-sheriff-500 sm:text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Contribution</th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteer</th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Requested Sign</th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Has Sign</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredSupporters.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No supporters found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredSupporters.map((supporter) => (
                <React.Fragment key={supporter.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-sheriff-100 flex items-center justify-center text-sheriff-700 font-bold text-xs">
                          {supporter.firstName[0]}{supporter.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{supporter.firstName} {supporter.lastName}</div>
                          <div className="text-xs text-slate-500">{supporter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">${supporter.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <input 
                        type="checkbox" 
                        checked={!!supporter.isVolunteer} 
                        onChange={() => handleToggle(supporter, 'isVolunteer')}
                        className="h-4 w-4 text-sheriff-600 focus:ring-sheriff-500 border-slate-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <input 
                        type="checkbox" 
                        checked={!!supporter.requestedSign} 
                        onChange={() => handleToggle(supporter, 'requestedSign')}
                        className="h-4 w-4 text-sheriff-600 focus:ring-sheriff-500 border-slate-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <input 
                        type="checkbox" 
                        checked={!!supporter.hasSign} 
                        onChange={() => handleToggle(supporter, 'hasSign')}
                        className="h-4 w-4 text-sheriff-600 focus:ring-sheriff-500 border-slate-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{supporter.city}</div>
                      <div className="text-xs text-slate-500">{supporter.zip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === supporter.id ? null : supporter.id)}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeDropdownId === supporter.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 top-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-30 py-1 animate-in fade-in zoom-in duration-75 origin-top-right"
                        >
                          <button 
                            onClick={() => handleViewDetails(supporter)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
                            View Profile
                          </button>
                          <button 
                            onClick={() => onEditSupporter && onEditSupporter(supporter)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-slate-400" />
                            Edit Info
                          </button>
                          <button 
                            onClick={() => handleGenerateNote(supporter)}
                            disabled={generatingId === supporter.id}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                          >
                            {generatingId === supporter.id ? (
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
                  {generatedNote && generatedNote.id === supporter.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-sheriff-50">
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

      {/* Supporter Detail Modal */}
      {viewingSupporter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-sheriff-950 p-6 text-white relative">
              <button 
                onClick={() => setViewingSupporter(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gold-500 flex items-center justify-center text-sheriff-950 font-black text-2xl shadow-lg">
                  {viewingSupporter.firstName[0]}{viewingSupporter.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{viewingSupporter.firstName} {viewingSupporter.lastName}</h2>
                  <p className="text-sheriff-400 text-sm font-medium">Contributor ID: {viewingSupporter.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Total Contribution</p>
                  <p className="text-xl font-black text-emerald-600">${viewingSupporter.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Donation Date</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(viewingSupporter.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${viewingSupporter.isVolunteer ? 'bg-sheriff-50 border-sheriff-200 text-sheriff-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Volunteer</span>
                  <span className="text-xs font-bold">{viewingSupporter.isVolunteer ? 'YES' : 'NO'}</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${viewingSupporter.requestedSign ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Req. Sign</span>
                  <span className="text-xs font-bold">{viewingSupporter.requestedSign ? 'YES' : 'NO'}</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${viewingSupporter.hasSign ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Has Sign</span>
                  <span className="text-xs font-bold">{viewingSupporter.hasSign ? 'YES' : 'NO'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Contact & Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <AtSign className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingSupporter.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingSupporter.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">{viewingSupporter.occupation || 'Occupation unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">Age: {viewingSupporter.age || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Address</h3>
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-sheriff-500 mt-0.5" />
                  <div className="text-sm">
                    <p>{viewingSupporter.address}</p>
                    <p>{viewingSupporter.city}, {viewingSupporter.zip}</p>
                  </div>
                </div>
              </div>

              {viewingSupporter.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Internal Notes</h3>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-sm italic">
                    "{viewingSupporter.notes}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewingSupporter(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (onEditSupporter) onEditSupporter(viewingSupporter);
                  setViewingSupporter(null);
                }}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg"
              >
                Edit Supporter
              </button>
              <button 
                onClick={() => handleGenerateNote(viewingSupporter)}
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
