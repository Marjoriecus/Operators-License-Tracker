"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CertInput from './components/CertInput';
import OperatorCard from './components/OperatorCard';

export default function LicenseTracker() {
  const [name, setName] = useState('');
  const [certs, setCerts] = useState({
    cert_forklift: '', cert_pe4000: '', cert_rc5500: '',
    cert_sp3000: '', cert_tsp6000: '', cert_pw3000: ''
  });
  const [operators, setOperators] = useState([]);

  // Fetch Logic
  const fetchOperators = async () => {
    const { data, error } = await supabase.from('operators').select('*').order('name');
    if (!error) setOperators(data);
  };

  useEffect(() => { fetchOperators(); }, []);

  // Handler for adding new profiles
  const handleAddOperator = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('operators').insert([{ name, ...certs }]);
    if (!error) {
      setName('');
      setCerts({ cert_forklift: '', cert_pe4000: '', cert_rc5500: '', cert_sp3000: '', cert_tsp6000: '', cert_pw3000: '' });
      fetchOperators();
    }
  };

  const getStatus = (dateString) => {
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'EXPIRED', text: 'text-red-700', bg: 'bg-red-50' };
    if (diffDays <= 30) return { label: 'SOON', text: 'text-yellow-800', bg: 'bg-yellow-50' };
    return { label: 'VALID', text: 'text-green-700', bg: 'bg-green-50' };
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* FORM SECTION */}
        <section className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Register New Operator Profile</h2>
          <form onSubmit={handleAddOperator} className="space-y-4">
            <input 
              required className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold outline-none focus:bg-white/20"
              placeholder="Operator Full Name" value={name} onChange={(e) => setName(e.target.value)} 
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CertInput label="SF 18329 Forklift" value={certs.cert_forklift} onChange={(val) => setCerts({...certs, cert_forklift: val})} />
              <CertInput label="PE 4000/4500" value={certs.cert_pe4000} onChange={(val) => setCerts({...certs, cert_pe4000: val})} />
              <CertInput label="RC 5500" value={certs.cert_rc5500} onChange={(val) => setCerts({...certs, cert_rc5500: val})} />
              <CertInput label="SP 3000/4000" value={certs.cert_sp3000} onChange={(val) => setCerts({...certs, cert_sp3000: val})} />
              <CertInput label="TSP 6000" value={certs.cert_tsp6000} onChange={(val) => setCerts({...certs, cert_tsp6000: val})} />
              <CertInput label="PW 3000 Pallet" value={certs.cert_pw3000} onChange={(val) => setCerts({...certs, cert_pw3000: val})} />
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-400 py-4 rounded-2xl font-black uppercase tracking-widest transition-all">Create Profile</button>
          </form>
        </section>

        {/* PROFILES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operators.map(op => (
            <OperatorCard key={op.id} operator={op} getStatus={getStatus} onDelete={async (id) => {
              await supabase.from('operators').delete().eq('id', id);
              fetchOperators();
            }} />
          ))}
        </div>

      </div>
    </main>
  );
}