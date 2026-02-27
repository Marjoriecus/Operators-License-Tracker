"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LicenseTracker() {
  const [name, setName] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [expiry, setExpiry] = useState('');
  const [operators, setOperators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchOperators = async () => {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .order('expiry_date', { ascending: true });
    if (!error) setOperators(data);
  };

  useEffect(() => { 
    fetchOperators(); 
  }, []);

  const handleAddOperator = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('operators')
      .insert([{ 
        name, 
        issued_date: issuedDate, 
        expiry_date: expiry, 
        status: 'Active' 
      }]);
    
    if (!error) {
      setName(''); setIssuedDate(''); setExpiry('');
      fetchOperators();
    } else {
      console.error("Error adding operator:", error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this operator?")) {
      const { error } = await supabase.from('operators').delete().eq('id', id);
      if (!error) fetchOperators();
    }
  };

  const downloadReport = () => {
    const headers = ["Name", "Issued Date", "Expiry Date", "Status"];
    const rows = filteredOps.map(op => {
      const status = getStatus(op.expiry_date);
      return [op.name, op.issued_date, op.expiry_date, status.label];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Permit_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatus = (dateString) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'EXPIRED', text: 'text-red-700', bg: 'bg-red-100' };
    if (diffDays <= 30) return { label: 'EXPIRING SOON', text: 'text-yellow-800', bg: 'bg-yellow-100' };
    return { label: 'VALID', text: 'text-green-700', bg: 'bg-green-100' };
  };

  const counts = {
    ALL: operators.length,
    VALID: operators.filter(op => getStatus(op.expiry_date).label === 'VALID').length,
    EXPIRING: operators.filter(op => getStatus(op.expiry_date).label === 'EXPIRING SOON').length,
    EXPIRED: operators.filter(op => getStatus(op.expiry_date).label === 'EXPIRED').length,
  };

  const filteredOps = operators.filter(op => {
    const status = getStatus(op.expiry_date);
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'VALID') return matchesSearch && status.label === 'VALID';
    if (activeTab === 'EXPIRING') return matchesSearch && status.label === 'EXPIRING SOON';
    if (activeTab === 'EXPIRED') return matchesSearch && status.label === 'EXPIRED';
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        
        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Operator Permit Tracker</h1>
          <p className="text-slate-400 text-xs mt-2 uppercase font-bold tracking-tighter">Compliance Dashboard</p>
        </div>

        <div className="p-8 space-y-8">
          {/* FORM */}
          <form onSubmit={handleAddOperator} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Employee Name</label>
              <input 
                required 
                className="p-3 rounded-xl border border-slate-200 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Issued Date</label>
                 <input type="date" required className="p-3 rounded-xl border border-slate-200 font-bold outline-none" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Expiration Date</label>
                 <input type="date" required className="p-3 rounded-xl border border-slate-200 font-bold outline-none" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all active:scale-95 shadow-lg">Add to Registry</button>
          </form>

          {/* SEARCH & EXPORT */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input className="w-full p-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="absolute left-4 top-4 grayscale opacity-50">🔍</span>
            </div>
            <button onClick={downloadReport} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95">Export CSV</button>
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl">
            {['ALL', 'VALID', 'EXPIRING', 'EXPIRED'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          {/* LIST */}
          <div className="grid gap-3">
            {filteredOps.map((op) => {
              const status = getStatus(op.expiry_date);
              return (
                <div key={op.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">
                      {op.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Expires: {op.expiry_date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`${status.bg} ${status.text} px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter`}>{status.label}</div>
                    <button onClick={() => handleDelete(op.id)} className="p-2 text-slate-200 hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}