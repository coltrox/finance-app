import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, 
  Plus, Calendar, Layers, BarChart3 
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import './App.css';

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('finance_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({ desc: '', val: '', type: 'income' });

  useEffect(() => {
    localStorage.setItem('finance_v3', JSON.stringify(items));
  }, [items]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.desc || !form.val) return;
    const n = { ...form, id: Date.now(), val: parseFloat(form.val), date: new Date().toLocaleDateString('pt-BR') };
    setItems([n, ...items]);
    setForm({ ...form, desc: '', val: '' });
  };

  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  // Cálculos
  const incomeItems = items.filter(i => i.type === 'income');
  const expenseItems = items.filter(i => i.type === 'expense');
  const fixedItems = items.filter(i => i.type === 'fixed');

  const totIn = incomeItems.reduce((a, b) => a + b.val, 0);
  const totOut = expenseItems.reduce((a, b) => a + b.val, 0);
  const totFix = fixedItems.reduce((a, b) => a + b.val, 0);
  const balance = totIn - (totOut + totFix);

  const chartData = [
    { name: 'Ganhos', value: totIn, color: '#10b981' },
    { name: 'Variáveis', value: totOut, color: '#ef4444' },
    { name: 'Fixas', value: totFix, color: '#8b5cf6' }
  ];

  return (
    <div className="dashboard">
      {/* PAINEL LATERAL DE CONTROLE */}
      <aside className="sidebar-input">
        <div className="brand">
          <Wallet size={32} />
          <span>Finance.hub</span>
        </div>

        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>O QUE FOI LANÇADO?</label>
            <input 
              type="text" 
              placeholder="Ex: Salário, Aluguel, Mercado" 
              value={form.desc}
              onChange={e => setForm({...form, desc: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>VALOR (R$)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00"
              value={form.val}
              onChange={e => setForm({...form, val: e.target.value})}
            />
          </div>

          <label className="form-group label">CATEGORIA DO LANÇAMENTO</label>
          <div className="category-toggle">
            <button type="button" onClick={()=>setForm({...form, type: 'income'})} className={`cat-btn btn-in ${form.type === 'income' ? 'active' : ''}`}>GANHO</button>
            <button type="button" onClick={()=>setForm({...form, type: 'expense'})} className={`cat-btn btn-out ${form.type === 'expense' ? 'active' : ''}`}>GASTO</button>
            <button type="button" onClick={()=>setForm({...form, type: 'fixed'})} className={`cat-btn btn-fix ${form.type === 'fixed' ? 'active' : ''}`}>FIXA</button>
          </div>

          <button type="submit" style={{width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px'}}>
            Confirmar e Adicionar
          </button>
        </form>

        <div style={{marginTop: '40px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb'}}>
          <h4 style={{margin: '0 0 15px 0', fontSize: '12px', color: 'var(--text-secondary)'}}>VISUALIZAÇÃO RÁPIDA</h4>
          <div style={{height: 150}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>

      {/* ÁREA DE VISUALIZAÇÃO PRINCIPAL */}
      <main className="viewport">
        <div className="summary-grid">
          <div className="card" style={{borderLeftColor: 'var(--primary)'}}>
            <h4>Saldo Disponível</h4>
            <span className="value" style={{color: balance >= 0 ? 'var(--in)' : 'var(--out)'}}>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="card" style={{borderLeftColor: 'var(--in)'}}>
            <h4>Total Recebido</h4>
            <span className="value" style={{color: 'var(--in)'}}>R$ {totIn.toLocaleString('pt-BR')}</span>
          </div>
          <div className="card" style={{borderLeftColor: 'var(--out)'}}>
            <h4>Total Gasto</h4>
            <span className="value" style={{color: 'var(--out)'}}>R$ {(totOut + totFix).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="lists-grid">
          {/* LISTA DE ENTRADAS */}
          <section className="list-container">
            <div className="list-header" style={{color: 'var(--in)'}}>
              <h3><TrendingUp size={18} /> Ganhos e Entradas</h3>
              <span>R$ {totIn.toLocaleString()}</span>
            </div>
            <div className="item-list">
              {incomeItems.map(i => <Row key={i.id} i={i} onDel={removeItem} color="var(--in)" />)}
            </div>
          </section>

          {/* LISTA DE GASTOS VARIÁVEIS */}
          <section className="list-container">
            <div className="list-header" style={{color: 'var(--out)'}}>
              <h3><TrendingDown size={18} /> Gastos Variáveis</h3>
              <span>R$ {totOut.toLocaleString()}</span>
            </div>
            <div className="item-list">
              {expenseItems.map(i => <Row key={i.id} i={i} onDel={removeItem} color="var(--out)" />)}
            </div>
          </section>

          {/* LISTA DE CONTAS FIXAS */}
          <section className="list-container" style={{gridColumn: 'span 2'}}>
            <div className="list-header" style={{color: 'var(--fix)'}}>
              <h3><Layers size={18} /> Compromissos e Contas Fixas</h3>
              <span>Custo Fixo Total: R$ {totFix.toLocaleString()}</span>
            </div>
            <div className="item-list" style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
              {fixedItems.map(i => <Row key={i.id} i={i} onDel={removeItem} color="var(--fix)" />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Componente de Linha de Item
const Row = ({ i, onDel, color }) => (
  <div className="item">
    <div className="item-info">
      <b>{i.desc}</b>
      <span>{i.date}</span>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
      <span className="item-val" style={{color: color}}>R$ {i.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
      <button onClick={() => onDel(i.id)} className="btn-del" style={{background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer'}}><Trash2 size={18}/></button>
    </div>
  </div>
);

export default App;