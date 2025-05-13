// frontend/src/components/GateForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function GateForm() {
  const [formData, setFormData] = useState({
    lungime: 3600,
    inaltime: 1800,
    lamele: '100x20',
    distantaLamele: 20,
    culoare: 'RAL1',
    kitAutomatizari: false,
    montajPoarta: false,
    montajAutomatizari: false,
    reducere: 0
  });

  const [rezultat, setRezultat] = useState(null);
  const [sugestii, setSugestii] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const sugestiiDinInaltime = useMemo(() => {
    const rezultate = [];
    const tinta = Number(formData.inaltime);
    [100, 80, 60, 40].forEach(h => {
      for (let d = 20; d <= 100; d += 5) {
        for (let n = 2; n < 50; n++) {
          const total = n * h + (n - 1) * d + 160;
          if (total === tinta) {
            rezultate.push({ lamele: `${h}x20`, distanta: d, bucati: n });
          }
        }
      }
    });
    return rezultate;
  }, [formData.inaltime]);

  const aplicaSugestie = (sugestie) => {
    setFormData(prev => ({
      ...prev,
      lamele: sugestie.lamele,
      distantaLamele: sugestie.distanta
    }));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.post('https://poarta-backend.onrender.com/calculate', formData);
        setRezultat(response.data);
        setSugestii(sugestiiDinInaltime);
      } catch (err) {
        console.error('Eroare calcul:', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [formData, sugestiiDinInaltime]);

  const handleExportPdf = async () => {
    const response = await axios.post('https://poarta-backend.onrender.com/generate-pdf', rezultat, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'oferta.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h2>Calculator Poartă Batantă ORIZONTAL</h2>
      <form className="space-y-4">
        <div>
          <label>Lungime (mm): </label>
          <input type="number" name="lungime" value={formData.lungime} onChange={handleChange} />
        </div>
        <div>
          <label>Înălțime (mm): </label>
          <input type="number" name="inaltime" value={formData.inaltime} onChange={handleChange} min="1000" max="2200" />
        </div>

        {sugestii.length > 0 && (
          <div style={{ backgroundColor: '#f8f8f8', padding: '10px', margin: '10px 0' }}>
            <strong>Sugestii pentru această înălțime:</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Lamele</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Distanță (mm)</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Bucăți</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Actiune</th>
                </tr>
              </thead>
              <tbody>
                {sugestii.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{s.lamele}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{s.distanta}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{s.bucati}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                      <button onClick={() => aplicaSugestie(s)}>Aplică</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <label>Lamele: </label>
          <select name="lamele" value={formData.lamele} onChange={handleChange}>
            {['100x20', '80x20', '60x20', '40x20'].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </div>
        <div>
          <label>Distanță între lamele (mm): </label>
          <input type="number" name="distantaLamele" value={formData.distantaLamele} onChange={handleChange} />
        </div>
        <div>
          <label>Culoare: </label>
          <select name="culoare" value={formData.culoare} onChange={handleChange}>
            {['Nu', 'RAL1', 'RAL2'].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </div>
        <div>
          <label>
            <input type="checkbox" name="kitAutomatizari" checked={formData.kitAutomatizari} onChange={handleChange} />
            Kit automatizări
          </label>
          <label>
            <input type="checkbox" name="montajPoarta" checked={formData.montajPoarta} onChange={handleChange} />
            Montaj poartă
          </label>
          <label>
            <input type="checkbox" name="montajAutomatizari" checked={formData.montajAutomatizari} onChange={handleChange} />
            Montaj automatizări
          </label>
        </div>
        <div>
          <label>Reducere (%): </label>
          <input type="number" name="reducere" value={formData.reducere} onChange={handleChange} max="10" />
        </div>
      </form>

      {rezultat && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Rezultate:</h3>
          <ul>
            <li>Total materii prime: {rezultat.materiiPrime} lei</li>
            <li>Total servicii: {rezultat.servicii} lei</li>
            <li>Servicii adiționale: {rezultat.serviciiAditionale} lei</li>
            <li>Fond social: {rezultat.fondSocial} lei</li>
            <li>Regie: {rezultat.regie} lei</li>
            <li>Rentabilitate: {rezultat.rentabilitate} lei</li>
            <li>TVA: {rezultat.TVA} lei</li>
            <li><strong>Preț final: {rezultat.pretFinal} lei</strong></li>
          </ul>
          <button onClick={handleExportPdf}>Exportă PDF</button>
        </div>
      )}
    </div>
  );
}

export default GateForm;
