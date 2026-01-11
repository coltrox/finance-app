import React, { useState, useEffect } from 'react';
import { Wallet, Trash2, FileDown, Plus, TrendingUp, TrendingDown, Layers, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('finance_pro_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ desc: '', val: '', type: 'income', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    localStorage.setItem('finance_pro_v6', JSON.stringify(data));
  }, [data]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!form.desc || !form.val) return;
    const newItem = { ...form, id: Date.now(), val: parseFloat(form.val) };
    setData([newItem, ...data]);
    setForm({ ...form, desc: '', val: '' });
  };

  const deleteItem = (id) => setData(data.filter(i => i.id !== id));

  // Filtros
  const filteredData = data.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totIn = filteredData.filter(i => i.type === 'income').reduce((a, b) => a + b.val, 0);
  const totOut = filteredData.filter(i => i.type === 'expense').reduce((a, b) => a + b.val, 0);
  const totFix = filteredData.filter(i => i.type === 'fixed').reduce((a, b) => a + b.val, 0);
  const balance = totIn - (totOut + totFix);

  const chartData = [
    { name: 'Ganhos', v: totIn, c: '#10b981' },
    { name: 'Gastos', v: totOut, c: '#ef4444' },
    { name: 'Fixas', v: totFix, c: '#8b5cf6' }
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Relatorio Financeiro - ${MESES[selectedMonth]} / ${selectedYear}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Saldo Final: R$ ${balance.toLocaleString('pt-BR')}`, 14, 30);
    
    const rows = filteredData.map(i => [
      new Date(i.date).toLocaleDateString('pt-BR'),
      i.desc,
      i.type.toUpperCase(),
      `R$ ${i.val.toLocaleString('pt-BR')}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Descricao', 'Tipo', 'Valor']],
      body: rows,
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`financeiro-${MESES[selectedMonth]}.pdf`);
  };

  return (
    <div className="dashboard-layout">
      <aside className="entry-sidebar">
        <div className="brand-title"><Wallet size={30} /> Finance.io</div>
        
        <span className="label-mini">Filtrar por Mês</span>
        <div className="month-grid">
          {MESES.map((m, idx) => (
            <button key={m} onClick={() => setSelectedMonth(idx)} className={`month-btn ${selectedMonth === idx ? 'active' : ''}`}>{m}</button>
          ))}
        </div>

        <div className="input-card">
          <form onSubmit={addTransaction}>
            <label className="label-mini">O que é?</label>
            <input className="main-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Ex: Salário" />
            <label className="label-mini">Valor (R$)</label>
            <input className="main-input" type="number" step="0.01" value={form.val} onChange={e => setForm({...form, val: e.target.value})} placeholder="0,00" />
            <label className="label-mini">Data</label>
            <input className="main-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            
            <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
              <button type="button" onClick={()=>setForm({...form, type:'income'})} className={`month-btn ${form.type==='income'?'active':''}`} style={{flex:1}}>GANHO</button>
              <button type="button" onClick={()=>setForm({...form, type:'expense'})} className={`month-btn ${form.type==='expense'?'active':''}`} style={{flex:1}}>GASTO</button>
              <button type="button" onClick={()=>setForm({...form, type:'fixed'})} className={`month-btn ${form.type==='fixed'?'active':''}`} style={{flex:1}}>FIXA</button>
            </div>
            <button type="submit" style={{width:'100%', padding:'15px', borderRadius:'12px', background:'var(--primary)', color:'white', border:'none', fontWeight:'800', cursor:'pointer'}}>Lançar Agora</button>
          </form>
        </div>
      </aside>

      <main className="content-area">
        <header className="content-header">
          <div>
            <h1 style={{margin:0, fontSize:'36px'}}>Gestão de {MESES[selectedMonth]}</h1>
            <p style={{color:'var(--text-gray)'}}>Visão geral do ano de {selectedYear}</p>
          </div>
          <button onClick={exportPDF} className="btn-export">
            <FileDown size={20} /> Exportar PDF
          </button>
        </header>

        <section className="summary-cards">
          <div className="card-pro" style={{background:'var(--primary)', color:'white'}}>
            <span className="label-mini" style={{color:'rgba(255,255,255,0.7)'}}>Saldo Líquido</span>
            <h2>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
          </div>
          <div className="card-pro">
            <span className="label-mini">Entradas Mensais</span>
            <h2 style={{color:'var(--success)'}}>R$ {totIn.toLocaleString('pt-BR')}</h2>
          </div>
          <div className="card-pro">
            <span className="label-mini">Saídas Totais</span>
            <h2 style={{color:'var(--danger)'}}>R$ {(totOut + totFix).toLocaleString('pt-BR')}</h2>
          </div>
        </section>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'30px'}}>
          <div className="card-pro">
            <h4 style={{marginTop:0}}>Composição Mensal</h4>
            <div style={{height: 250}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip cursor={{fill:'transparent'}} />
                  <Bar dataKey="v" radius={[10, 10, 10, 10]}>
                    {chartData.map((e, idx) => <Cell key={idx} fill={e.c} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="history-card-pro">
            <div style={{padding:'20px', borderBottom:'1px solid #eee', fontWeight:'bold'}}>Últimos Lançamentos</div>
            <div style={{maxHeight:'400px', overflowY:'auto'}}>
              {filteredData.length === 0 && <div style={{padding:'40px', textAlign:'center', color:'#999'}}>Sem dados.</div>}
              {filteredData.map(i => (
                <div key={i.id} className="row-item">
                  <div>
                    <div style={{fontWeight:700}}>{i.desc}</div>
                    <div style={{fontSize:'11px', color:'#999'}}>{new Date(i.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{fontWeight:800, color: i.type==='income'?'var(--success)':'var(--danger)'}}>
                      {i.type==='income'?'+':'-'} R$ {i.val.toLocaleString()}
                    </span>
                    <button onClick={()=>deleteItem(i.id)} style={{border:'none', background:'none', color:'#ccc', cursor:'pointer'}}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;