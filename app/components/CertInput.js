// components/CertInput.js
export default function CertInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase">{label}</label>
      <input 
        type="date" 
        className="text-xs font-bold outline-none text-slate-700"
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}