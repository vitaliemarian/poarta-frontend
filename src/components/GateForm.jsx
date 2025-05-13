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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validInaltimi = useMemo(() => {
    const [hLamela] = formData.lamele.split('x').map(Number);
    const dist = Number(formData.distantaLamele);
    const rezultat = [];
    for (let n = 2; n < 50; n++) {
      const inaltime = (n - 1) * (hLamela + dist) + hLamela + dist + 160;
      if (inaltime >= 1000 && inaltime <= 2200) {
        rezultat.push(inaltime);
      }
    }
    return rezultat.reverse();
  }, [formData.lamele, formData.distantaLamele]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.post('https://poarta-backend.onrender.com/calculate', formData);
        setRezultat(response.data);
      } catch (err) {
        console.error('Eroare calcul:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [formData]);

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
          <label>Lamele: </label>
          <select name="lamele" value={formData.lamele} onChange={handleChange}>
            {['100x20', '80x20', '60x20', '40x20'].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Distanță între lamele (mm): </label>
          <input type="number" name="distantaLamele" value={formData.distantaLamele} onChange={handleChange} />
        </div>
        <div>
          <label>Înălțime (mm): </label>
          <select name="inaltime" value={formData.inaltime} onChange={handleChange}>
            {validInaltimi.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Culoare: </label>
          <select name="culoare" value={formData.culoare} onChange={handleChange}>
            {['Nu', 'RAL1', 'RAL2'].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
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
