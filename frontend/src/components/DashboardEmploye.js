import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DashboardEmploye = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    titre: '',
    description: '',
    priorité: 'moyenne'
  });
  const [userInfo, setUserInfo] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est employé
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!storedUserInfo || storedUserInfo.role !== 'employe') {
      navigate('/login');
      return;
    }
    
    setUserInfo(storedUserInfo);
    fetchTickets();
  }, [navigate]);
  
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/tickets', {
        withCredentials: true
      });
      setTickets(res.data.data);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la récupération des tickets'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleTicketDialogOpen = () => {
    setTicketFormData({
      titre: '',
      description: '',
      priorité: 'moyenne'
    });
    setOpenTicketDialog(true);
  };
  
  const handleTicketDialogClose = () => {
    setOpenTicketDialog(false);
  };
  
  const handleViewDialogOpen = (ticket) => {
    setSelectedTicket(ticket);
    setOpenViewDialog(true);
  };
  
  const handleViewDialogClose = () => {
    setOpenViewDialog(false);
  };
  
  const handleTicketChange = (e) => {
    setTicketFormData({
      ...ticketFormData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tickets', ticketFormData, {
        withCredentials: true
      });
      
      handleTicketDialogClose();
      fetchTickets();
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la création du ticket'
      );
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  const getStatusCount = (statut) => {
    return tickets.filter(ticket => ticket.statut === statut).length;
  };
  
  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              Dashboard Employé
            </Typography>
            {userInfo && (
              <Typography variant="subtitle1">
                Bienvenue, {userInfo.nom}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchTickets}
              startIcon={<RefreshIcon />}
              sx={{ mr: 2 }}
            >
              Actualiser
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Tickets
                </Typography>
                <Typography variant="h4">
                  {tickets.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Nouveaux
                </Typography>
                <Typography variant="h4">
                  {getStatusCount('nouveau')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  En cours
                </Typography>
                <Typography variant="h4">
                  {getStatusCount('en cours')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Résolus
                </Typography>
                <Typography variant="h4">
                  {getStatusCount('résolu')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Mes Tickets</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleTicketDialogOpen}
          >
            Nouveau Ticket
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Technicien</TableCell>
                <TableCell>Date Création</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>{ticket.titre}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.priorité}
                      color={
                        ticket.priorité === 'haute' || ticket.priorité === 'urgente' 
                          ? 'error' 
                          : ticket.priorité === 'moyenne' 
                            ? 'warning' 
                            : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.statut}
                      color={
                        ticket.statut === 'nouveau' 
                          ? 'info' 
                          : ticket.statut === 'en cours' 
                            ? 'warning' 
                            : ticket.statut === 'résolu' || ticket.statut === 'fermé'
                              ? 'success'
                              : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket.technicienId?.nom || 'Non assigné'}</TableCell>
                  <TableCell>{new Date(ticket.dateCréation).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      color="primary"
                      startIcon={<InfoIcon />}
                      onClick={() => handleViewDialogOpen(ticket)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun ticket trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog pour créer un ticket */}
      <Dialog open={openTicketDialog} onClose={handleTicketDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau ticket</DialogTitle>
        <form onSubmit={handleTicketSubmit}>
          <DialogContent>
            <TextField
              label="Titre"
              name="titre"
              value={ticketFormData.titre}
              onChange={handleTicketChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={ticketFormData.description}
              onChange={handleTicketChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priorité</InputLabel>
              <Select
                name="priorité"
                value={ticketFormData.priorité}
                onChange={handleTicketChange}
                label="Priorité"
              >
                <MenuItem value="basse">Basse</MenuItem>
                <MenuItem value="moyenne">Moyenne</MenuItem>
                <MenuItem value="haute">Haute</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTicketDialogClose} color="secondary">
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Créer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Dialog pour voir les détails d'un ticket */}
      <Dialog open={openViewDialog} onClose={handleViewDialogClose} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>{selectedTicket.titre}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Description:
              </Typography>
              <Typography paragraph>
                {selectedTicket.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">
                    Priorité: 
                    <Chip 
                      label={selectedTicket.priorité}
                      color={
                        selectedTicket.priorité === 'haute' || selectedTicket.priorité === 'urgente' 
                          ? 'error' 
                          : selectedTicket.priorité === 'moyenne' 
                            ? 'warning' 
                            : 'success'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">
                    Statut: 
                    <Chip 
                      label={selectedTicket.statut}
                      color={
                        selectedTicket.statut === 'nouveau' 
                          ? 'info' 
                          : selectedTicket.statut === 'en cours' 
                            ? 'warning' 
                            : selectedTicket.statut === 'résolu' || selectedTicket.statut === 'fermé'
                              ? 'success'
                              : 'default'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">
                    Date de création: {new Date(selectedTicket.dateCréation).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">
                    Technicien: {selectedTicket.technicienId?.nom || 'Non assigné'}
                  </Typography>
                </Grid>
                
                {selectedTicket.fichierJoint && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      Fichier joint: {selectedTicket.fichierJoint}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Historique:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Effectué par</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTicket.historique && selectedTicket.historique.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                        <TableCell>{item.action}</TableCell>
                        <TableCell>{item.effectuéPar}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedTicket.historique || selectedTicket.historique.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          Aucun historique disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewDialogClose} color="primary">
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DashboardEmploye;