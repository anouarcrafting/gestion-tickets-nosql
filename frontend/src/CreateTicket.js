import React, { useState } from 'react';
import axios from 'axios';

export default function CreateTicket() {
  const [form, setForm] = useState({ titre: '', description: '', priorité: 'moyenne' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/tickets', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Erreur lors de la soumission');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Créer un Ticket</h2>
      <form onSubmit={handleSubmit}>
        <label>Titre:</label>
        <input name="titre" value={form.titre} onChange={handleChange} required />
        <br />
        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />
        <br />
        <label>Priorité:</label>
        <select name="priorité" value={form.priorité} onChange={handleChange}>
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
        <br /><br />
        <button type="submit">Envoyer</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
