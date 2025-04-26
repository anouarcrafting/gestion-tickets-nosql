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
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState({
    employes: [],
    techniciens: [],
    admins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    titre: '',
    description: '',
    priorité: 'moyenne',
    employeId: '',
    technicienId: ''
  });
  const [userFormData, setUserFormData] = useState({
    nom: '',
    email: '',
    login: '',
    motDePasse: '',
    role: 'employe',
    poste: '',
    departement: '',
    specialité: ''
  });
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est admin
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || (userInfo.role !== 'admin' && userInfo.role !== 'superadmin')) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les tickets
      const ticketsRes = await axios.get('http://localhost:5000/api/tickets', {
        withCredentials: true
      });
      setTickets(ticketsRes.data.data);
      
      // Récupérer les employés
      const employesRes = await axios.get('http://localhost:5000/api/users/employe', {
        withCredentials: true
      });
      
      // Récupérer les techniciens
      const techniciensRes = await axios.get('http://localhost:5000/api/users/technicien', {
        withCredentials: true
      });
      
      // Récupérer les admins
      const adminsRes = await axios.get('http://localhost:5000/api/users/admin', {
        withCredentials: true
      });
      
      setUsers({
        employes: employesRes.data.data,
        techniciens: techniciensRes.data.data,
        admins: adminsRes.data.data
      });
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la récupération des données'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleTicketDialogOpen = () => {
    setTicketFormData({
      titre: '',
      description: '',
      priorité: 'moyenne',
      employeId: '',
      technicienId: ''
    });
    setOpenTicketDialog(true);
  };
  
  const handleTicketDialogClose = () => {
    setOpenTicketDialog(false);
  };
  
  const handleUserDialogOpen = () => {
    setUserFormData({
      nom: '',
      email: '',
      login: '',
      motDePasse: '',
      role: 'employe',
      poste: '',
      departement: '',
      specialité: ''
    });
    setOpenUserDialog(true);
  };
  
  const handleUserDialogClose = () => {
    setOpenUserDialog(false);
  };
  
  const handleTicketChange = (e) => {
    setTicketFormData({
      ...ticketFormData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
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
      fetchData();
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la création du ticket'
      );
    }
  };

  // Fonction pour assigner un technicien à un ticket
  const handleTechnicianSelect = (ticketId, technicianId) => {
    setSelectedTechnicians((prev) => ({
      ...prev,
      [ticketId]: technicianId,
    }));
  };
  
  const handleAssignTechnician = async (ticketId) => {
    try {
      const technicianId = selectedTechnicians[ticketId];
      if (!technicianId) {
        alert('Veuillez sélectionner un technicien.');
        return;
      }
  
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, 
        { technicienId: technicianId, statut: 'en cours' }, 
        { withCredentials: true }
      );
  
      alert('Technicien assigné avec succès !');
      fetchData(); // Refresh list after assignment
    } catch (error) {
      console.error('Erreur assignation:', error);
      alert('Erreur lors de l\'assignation.');
    }
  };
  
  
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', userFormData, {
        withCredentials: true
      });
      
      handleUserDialogClose();
      fetchData();
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la création de l\'utilisateur'
      );
    }
  };
  
  const handleDeleteTicket = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tickets/${id}`, {
          withCredentials: true
        });
        
        fetchData();
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : 'Erreur lors de la suppression du ticket'
        );
      }
    }
  };
  
  const handleDeleteUser = async (role, id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${role}/${id}`, {
          withCredentials: true
        });
        
        fetchData();
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : 'Erreur lors de la suppression de l\'utilisateur'
        );
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              Dashboard Administration
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchData}
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
        <Paper sx={{ width: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Tickets" />
            <Tab label="Employés" />
            <Tab label="Techniciens" />
            <Tab label="Administrateurs" />
          </Tabs>
        </Paper>
      </Box>
      
      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Liste des Tickets</Typography>
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
                  <TableCell>Employé</TableCell>
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
                    <TableCell>{ticket.employeId?.nom || 'Non assigné'}</TableCell>
                    <TableCell>{ticket.technicienId?.nom || 'Non assigné'}</TableCell>
                    <TableCell>{new Date(ticket.dateCréation).toLocaleString()}</TableCell>
                    <TableCell>
                      <Select
                        value={selectedTechnicians[ticket._id] || ''}
                        onChange={(e) => handleTechnicianSelect(ticket._id, e.target.value)}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="" disabled>Choisir</MenuItem>
                        {users.techniciens.map((tech) => (
                          <MenuItem key={tech._id} value={tech._id}>
                            {tech.nom}
                          </MenuItem>
                        ))}
                      </Select>

                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleAssignTechnician(ticket._id)}
                        style={{ marginTop: 8 }}
                      >
                        Assigner
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteTicket(ticket._id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Liste des Employés</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => {
                setUserFormData({...userFormData, role: 'employe'});
                handleUserDialogOpen();
              }}
            >
              Nouvel Employé
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.employes.map((employe) => (
                  <TableRow key={employe._id}>
                    <TableCell>{employe.nom}</TableCell>
                    <TableCell>{employe.email}</TableCell>
                    <TableCell>{employe.login}</TableCell>
                    <TableCell>{employe.poste}</TableCell>
                    <TableCell>{employe.departement}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser('employe', employe._id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.employes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Liste des Techniciens</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => {
                setUserFormData({...userFormData, role: 'technicien'});
                handleUserDialogOpen();
              }}
            >
              Nouveau Technicien
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Spécialité</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.techniciens.map((technicien) => (
                  <TableRow key={technicien._id}>
                    <TableCell>{technicien.nom}</TableCell>
                    <TableCell>{technicien.email}</TableCell>
                    <TableCell>{technicien.login}</TableCell>
                    <TableCell>{technicien.specialité}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser('technicien', technicien._id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.techniciens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun technicien trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Liste des Administrateurs</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => {
                setUserFormData({...userFormData, role: 'admin'});
                handleUserDialogOpen();
              }}
            >
              Nouvel Admin
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.nom}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.login}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser('admin', admin._id)}
                        disabled={admin.role === 'superadmin'} // Empêcher la suppression du superadmin
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun administrateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
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
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Employé</InputLabel>
              <Select
                name="employeId"
                value={ticketFormData.employeId}
                onChange={handleTicketChange}
                label="Employé"
              >
                {users.employes.map((employe) => (
                  <MenuItem key={employe._id} value={employe._id}>
                    {employe.nom} ({employe.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Technicien</InputLabel>
              <Select
                name="technicienId"
                value={ticketFormData.technicienId}
                onChange={handleTicketChange}
                label="Technicien"
              >
                <MenuItem value="">Non assigné</MenuItem>
                {users.techniciens.map((technicien) => (
                  <MenuItem key={technicien._id} value={technicien._id}>
                    {technicien.nom} ({technicien.specialité})
                  </MenuItem>
                ))}
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
      
      {/* Dialog pour créer un utilisateur */}
      <Dialog open={openUserDialog} onClose={handleUserDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Créer un nouveau {
            userFormData.role === 'admin' 
              ? 'administrateur' 
              : userFormData.role === 'technicien' 
                ? 'technicien' 
                : 'employé'
          }
        </DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            <TextField
              label="Nom"
              name="nom"
              value={userFormData.nom}
              onChange={handleUserChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleUserChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Login"
              name="login"
              value={userFormData.login}
              onChange={handleUserChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={userFormData.motDePasse}
              onChange={handleUserChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rôle</InputLabel>
              <Select
                name="role"
                value={userFormData.role}
                onChange={handleUserChange}
                label="Rôle"
              >
                <MenuItem value="admin">Administrateur</MenuItem>
                <MenuItem value="technicien">Technicien</MenuItem>
                <MenuItem value="employe">Employé</MenuItem>
              </Select>
            </FormControl>
            
            {userFormData.role === 'employe' && (
              <>
                <TextField
                  label="Poste"
                  name="poste"
                  value={userFormData.poste}
                  onChange={handleUserChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Département"
                  name="departement"
                  value={userFormData.departement}
                  onChange={handleUserChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </>
            )}
            
            {userFormData.role === 'technicien' && (
              <TextField
                label="Spécialité"
                name="specialité"
                value={userFormData.specialité}
                onChange={handleUserChange}
                fullWidth
                margin="normal"
                required
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUserDialogClose} color="secondary">
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Créer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default DashboardAdmin;

//////////////////////////////////////////////////
// // App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// // Composants de page
// const HomePage = () => {
//   return <h2>Bienvenue sur le Dashboard Admin</h2>;
// };

// const UserManagementPage = () => {
//   return <h2>Gestion des Utilisateurs</h2>;
// };

// // Composant principal du Dashboard
// const DashboardAdmin = () => {
//   return (
//     <Router>
//       <div style={{ display: 'flex' }}>
//         <nav style={{ width: '200px', padding: '20px', background: '#f4f4f4' }}>
//           <ul>
//             <li>
//               <Link to="/">Accueil</Link>
//             </li>
//             <li>
//               <Link to="/users">Gestion des Utilisateurs</Link>
//             </li>
//           </ul>
//         </nav>

//         <div style={{ padding: '20px', flex: 1 }}>
//           <Routes>
//             <Route exact path="/" component={HomePage} />
//             <Route path="/users" component={UserManagementPage} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default DashboardAdmin;
