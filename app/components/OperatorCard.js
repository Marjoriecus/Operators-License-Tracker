// components/OperatorCard.js
export default function OperatorCard({ operator, onDelete, getStatus }) {
  const certs = [
    { id: 'cert_forklift', label: 'SF 18329 Forklift' },
    { id: 'cert_pe4000', label: 'PE 4000 - 4500' },
    { id: 'cert_rc5500', label: 'RC 5500' },
    { id: 'cert_sp3000', label: 'SP 3000 - 4000' },
    { id: 'cert_tsp6000', label: 'TSP 6000' },
    { id: 'cert_pw3000', label: 'PW 3000: Pallet Jack' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-xl text-slate-800 tracking-tight uppercase">{operator.name}</h3>
        <button onClick={() => onDelete(operator.id)} className="text-slate-300 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {certs.map((cert) => {
          const date = operator[cert.id];
          const status = date ? getStatus(date) : { label: 'N/A', bg: 'bg-slate-50', text: 'text-slate-400' };
          
          return (
            <div key={cert.id} className={`${status.bg} p-2 rounded-xl border border-black/5`}>
              <p className="text-[9px] font-black uppercase opacity-60 truncate">{cert.label}</p>
              <p className={`text-[10px] font-bold ${status.text}`}>
                {date ? date : 'No Record'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}