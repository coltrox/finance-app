import React, { useState, useEffect } from 'react';
import { Wallet, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import './App.css';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const CATEGORIAS = ['Alimentação', 'Lazer', 'Transporte', 'Saúde', 'Educação', 'Moradia', 'Salário', 'Outros'];

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('finance_v16_perfect');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMonths, setSelectedMonths] = useState([new Date().getMonth()]);
  const [form, setForm] = useState({ 
    desc: '', val: '', type: 'income', category: 'Outros', 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    localStorage.setItem('finance_v16_perfect', JSON.stringify(data));
  }, [data]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!form.desc || !form.val || !form.date) return;
    setData([...data, { ...form, id: Date.now(), val: parseFloat(form.val) }]);
    setForm({ ...form, desc: '', val: '' });
  };

  const deleteItem = (id) => setData(data.filter(i => i.id !== id));

  // Ordenação: Do mais antigo para o mais recente
  const filteredData = data
    .filter(item => {
      const month = new Date(item.date + 'T00:00:00').getMonth();
      return selectedMonths.includes(month);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const incomes = filteredData.filter(i => i.type === 'income');
  const expenses = filteredData.filter(i => i.type === 'expense');
  const fixeds = filteredData.filter(i => i.type === 'fixed');

  const totIn = incomes.reduce((a, b) => a + b.val, 0);
  const totOut = expenses.reduce((a, b) => a + b.val, 0);
  const totFix = fixeds.reduce((a, b) => a + b.val, 0);
  const balance = totIn - (totOut + totFix);

  return (
    <div className="dashboard-layout">
      <aside className="entry-sidebar">
        <div className="brand"><Wallet size={28} /> Finance.hub</div>
        
        <label className="label-mini">Filtrar Meses</label>
        <div className="month-selector">
          {MESES.map((m, idx) => (
            <button key={m} onClick={() => setSelectedMonths(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx])} className={`month-btn ${selectedMonths.includes(idx) ? 'active' : ''}`}>{m}</button>
          ))}
        </div>
        <button style={{width:'100%', padding:'8px', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:'8px', fontWeight:800, marginBottom:'25px', cursor:'pointer', fontSize:'11px'}} onClick={() => setSelectedMonths([])}>LIMPAR FILTRO</button>

        <form onSubmit={addTransaction}>
          <div className="input-group"><label>O que é?</label><input className="main-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Ex: Salário" /></div>
          <div className="input-group"><label>Valor (R$)</label><input className="main-input" type="number" step="0.01" value={form.val} onChange={e => setForm({...form, val: e.target.value})} placeholder="0,00" /></div>
          <div className="input-group">
            <label style={{color: 'var(--primary)'}}>Data (Selecione na tabela)</label>
            <input className="main-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="input-group"><label>Categoria</label><select className="main-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
            <button type="button" onClick={()=>setForm({...form, type:'income'})} className={`month-btn ${form.type==='income'?'active':''}`} style={{flex:1}}>RENDA</button>
            <button type="button" onClick={()=>setForm({...form, type:'expense'})} className={`month-btn ${form.type==='expense'?'active':''}`} style={{flex:1}}>GASTO</button>
            <button type="button" onClick={()=>setForm({...form, type:'fixed'})} className={`month-btn ${form.type==='fixed'?'active':''}`} style={{flex:1}}>FIXO</button>
          </div>
          <button type="submit" style={{width:'100%', padding:'15px', background:'var(--primary)', color:'white', border:'none', borderRadius:'10px', fontWeight:800, cursor:'pointer'}}>SALVAR AGORA</button>
        </form>
      </aside>

      <main className="content-area">
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
          <h1 style={{fontSize: '32px', fontWeight: 800}}>Dashboard: {selectedMonths.sort((a,b)=>a-b).map(m => MESES[m]).join(', ')}</h1>
          <div style={{background: 'white', padding: '15px 30px', borderRadius: '20px', textAlign: 'right', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
             <small style={{fontWeight:800, color:'var(--text-gray)'}}>SALDO NO PERÍODO</small>
             <h2 style={{margin:0, fontSize: '36px', color: balance >= 0 ? 'var(--header-income)' : 'var(--header-expense)'}}>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
          </div>
        </header>

        <div className="chart-container">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Rendas', valor: totIn }, { name: 'Gastos', valor: totOut }, { name: 'Fixos', valor: totFix }]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 'bold', fill: '#000'}} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="valor" radius={[12, 12, 0, 0]} barSize={100}>
                  <Cell fill="var(--header-income)"/><Cell fill="var(--header-expense)"/><Cell fill="var(--header-fixed)"/>
                </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="lists-grid-triple">
          <ListCol title="💰 RENDAS" data={incomes} color="var(--header-income)" total={totIn} del={deleteItem} />
          <ListCol title="💸 GASTOS" data={expenses} color="var(--header-expense)" total={totOut} del={deleteItem} />
          <ListCol title="🏠 FIXOS" data={fixeds} color="var(--header-fixed)" total={totFix} del={deleteItem} />
        </div>
      </main>
    </div>
  );
}

const ListCol = ({title, data, color, total, del}) => (
  <section className="list-card">
    <div className="list-header" style={{background: color}}>
      <span>{title}</span>
      <span>R$ {total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
    </div>
    <div style={{overflowY:'auto', flexGrow: 1}}>
      {data.map(item => (
        <div key={item.id} className="item-row">
          <div>
            <b>{item.desc}</b>
            <div className="date-sub">{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <span style={{fontWeight: 800, color: '#000'}}>R$ {item.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            <Trash2 size={16} color="#94a3b8" style={{cursor:'pointer'}} onClick={() => del(item.id)} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default App;