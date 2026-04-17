import React, { useState, useRef, useEffect } from "react";
import { Amounts, Donor } from "../types";
import {
  Search,
  Mail,
  Loader2,
  Filter,
  MoreVertical,
  Eye,
  X,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  AtSign,
  User,
  Edit2,
  CheckSquare,
  Square,
} from "lucide-react";

interface SupportersListProps {
  supporters: Donor[];
  onUpdateSupporter?: (supporter: Donor) => void;
  onEditSupporter?: (supporter: Donor) => void;
}

export const SupportersList: React.FC<SupportersListProps> = ({
  supporters,
  onUpdateSupporter,
  onEditSupporter,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVolunteer, setFilterVolunteer] = useState(false);
  const [filterRequestedSign, setFilterRequestedSign] = useState(false);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewingSupporter, setViewingSupporter] = useState<Donor | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [supportersData, setSupporters] = useState<Donor[]>(supporters);

  useEffect(() => {
    setSupporters(supporters);
  }, [supporters]);

  useEffect(() => {
    const loadDonationTotals = async () => {
      try {
        const response = await fetch("/api/GetDonationAmountsByUser");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const donationAmounts: Amounts[] = await response.json();
        const amountsById = new Map(
          donationAmounts.map((item) => [item.id, Number(item.amount) || 0]),
        );

        setSupporters((prev) =>
          prev.map((supporter) => ({
            ...supporter,
            amount: amountsById.get(Number(supporter.id)) ?? supporter.amount ?? 0,
          })),
        );
      } catch (error) {
        console.error("Failed to load donation totals:", error);
      }
    };

    loadDonationTotals();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSupporters = supportersData.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
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

  const handleToggle = (
    supporter: Donor,
    field: "isVolunteer" | "requestedSign" | "hasSign",
  ) => {
    if (onUpdateSupporter) {
      onUpdateSupporter({
        ...supporter,
        [field]: !supporter[field],
      });
    }
  };
  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Campaign Supporters
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Quick Filters */}
          {/* <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">


          
          </div> */}

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
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Total Monetary Contribution
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredSupporters.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
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
                          {(supporter.firstName?.[0] || "?")}{(supporter.lastName?.[0] || "?")}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {supporter.firstName} {supporter.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {supporter.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">
                        ${supporter.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {supporter.city}
                      </div>
                      <div className="text-xs text-slate-500">
                        {supporter.zip}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === supporter.id
                              ? null
                              : supporter.id,
                          )
                        }
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
                            onClick={() =>
                              onEditSupporter && onEditSupporter(supporter)
                            }
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-slate-400" />
                            Edit Info
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
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
                  {viewingSupporter.firstName?.[0] || "?"}
                  {viewingSupporter.lastName?.[0] || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {viewingSupporter.firstName} {viewingSupporter.lastName}
                  </h2>
                  <p className="text-sheriff-400 text-sm font-medium">
                    Contributor ID:{" "}
                    {viewingSupporter.id.split("-")[0].toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                    Total Monetary Contribution
                  </p>
                  <p className="text-xl font-black text-emerald-600">
                    ${viewingSupporter.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                    First Donation Date
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(viewingSupporter.date).toLocaleDateString(
                      "en-US",
                      { dateStyle: "long" },
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                  Contact & Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <AtSign className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">
                      {viewingSupporter.businessOrg || "No business/organization provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">
                      {viewingSupporter.employer || "No employer provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">
                      {viewingSupporter.occupation || "Occupation unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="h-4 w-4 text-sheriff-500" />
                    <span className="text-sm">
                      Age: {viewingSupporter.age || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                  Address
                </h3>
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-sheriff-500 mt-0.5" />
                  <div className="text-sm">
                    <p>{viewingSupporter.address}</p>
                    <p>
                      {viewingSupporter.city}, {viewingSupporter.zip}
                    </p>
                  </div>
                </div>
              </div>
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
                className="px-4 py-2 text-sm font-bold text-white hover:text-slate-900 transition-colors border border-slate-200 rounded-lg bg-orange-600"
              >
                Edit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
