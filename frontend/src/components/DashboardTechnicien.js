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
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const DashboardTechnicien = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    statut: '',
    priorité: '',
    commentaire: ''
  });
  const [userInfo, setUserInfo] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est technicien
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!storedUserInfo || storedUserInfo.role !== 'technicien') {
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
  
  const handleViewDialogOpen = (ticket) => {
    setSelectedTicket(ticket);
    setOpenViewDialog(true);
  };
  
  const handleViewDialogClose = () => {
    setOpenViewDialog(false);
  };
  
  const handleUpdateDialogOpen = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateFormData({
      statut: ticket.statut,
      priorité: ticket.priorité,
      commentaire: ''
    });
    setOpenUpdateDialog(true);
  };
  
  const handleUpdateDialogClose = () => {
    setOpenUpdateDialog(false);
  };
  
  const handleUpdateChange = (e) => {
    setUpdateFormData({
      ...updateFormData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const historique = selectedTicket.historique || [];
      
      if (updateFormData.commentaire) {
        historique.push({
          date: new Date(),
          action: `Commentaire: ${updateFormData.commentaire}`,
          effectuéPar: userInfo.email
        });
      }
      
      // Si le statut a changé
      if (updateFormData.statut !== selectedTicket.statut) {
        historique.push({
          date: new Date(),
          action: `Statut changé de ${selectedTicket.statut} à ${updateFormData.statut}`,
          effectuéPar: userInfo.email
        });
      }
      
      // Si la priorité a changé
      if (updateFormData.priorité !== selectedTicket.priorité) {
        historique.push({
          date: new Date(),
          action: `Priorité changée de ${selectedTicket.priorité} à ${updateFormData.priorité}`,
          effectuéPar: userInfo.email
        });
      }
      
      const updatedTicket = {
        statut: updateFormData.statut,
        priorité: updateFormData.priorité,
        historique
      };
      
      await axios.put(`http://localhost:5000/api/tickets/${selectedTicket._id}`, updatedTicket, {
        withCredentials: true
      });
      
      handleUpdateDialogClose();
      fetchTickets();
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la mise à jour du ticket'
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
              Dashboard Technicien
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
          <Typography variant="h6">Tickets assignés</Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Employé</TableCell>
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
                  <TableCell>{ticket.employeId?.nom || 'N/A'}</TableCell>
                  <TableCell>{new Date(ticket.dateCréation).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      color="primary"
                      startIcon={<InfoIcon />}
                      onClick={() => handleViewDialogOpen(ticket)}
                      sx={{ mr: 1 }}
                    >
                      Détails
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdateDialogOpen(ticket)}
                    >
                      Modifier
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
                    Employé: {selectedTicket.employeId?.nom || 'Non spécifié'}
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
      
      {/* Dialog pour mettre à jour un ticket */}
      <Dialog open={openUpdateDialog} onClose={handleUpdateDialogClose} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>Mettre à jour le ticket: {selectedTicket.titre}</DialogTitle>
            <form onSubmit={handleUpdateSubmit}>
              <DialogContent>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={updateFormData.statut}
                    onChange={handleUpdateChange}
                    label="Statut"
                  >
                    <MenuItem value="nouveau">Nouveau</MenuItem>
                    <MenuItem value="en cours">En cours</MenuItem>
                    <MenuItem value="en attente">En attente</MenuItem>
                    <MenuItem value="résolu">Résolu</MenuItem>
                    <MenuItem value="fermé">Fermé</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priorité</InputLabel>
                  <Select
                    name="priorité"
                    value={updateFormData.priorité}
                    onChange={handleUpdateChange}
                    label="Priorité"
                  >
                    <MenuItem value="basse">Basse</MenuItem>
                    <MenuItem value="moyenne">Moyenne</MenuItem>
                    <MenuItem value="haute">Haute</MenuItem>
                    <MenuItem value="urgente">Urgente</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Commentaire"
                  name="commentaire"
                  value={updateFormData.commentaire}
                  onChange={handleUpdateChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Ajouter un commentaire sur l'avancement du ticket..."
                />
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                  Ticket créé le {new Date(selectedTicket.dateCréation).toLocaleString()} par {selectedTicket.employeId?.nom || 'Employé inconnu'}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleUpdateDialogClose} color="secondary">
                  Annuler
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  Mettre à jour
                </Button>
              </DialogActions>
            </form>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DashboardTechnicien;