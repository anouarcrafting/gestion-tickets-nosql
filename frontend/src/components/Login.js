import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper
} from '@mui/material';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    login: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData, {
        withCredentials: true
      });

      console.log('Réponse serveur:', res.data);

      if (!res.data.user?.role) {
        throw new Error('Rôle utilisateur manquant dans la réponse');
      }

      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      setUser(res.data.user); // Mise à jour de l'état global
      navigate(`/${res.data.user.role}`); // Redirection basée sur la réponse directe

    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Erreur de connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Système de Gestion des Tickets
          </Typography>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            Connexion
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Login"
              variant="outlined"
              fullWidth
              margin="normal"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
            />
            <TextField
              label="Mot de passe"
              variant="outlined"
              fullWidth
              margin="normal"
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
