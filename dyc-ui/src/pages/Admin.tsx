import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados para logs de auditoría
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(10);
  const [auditTotal, setAuditTotal] = useState(0);
  
  // Estados para dashboard admin
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Estados para candidatos
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  
  // Estados para crear nuevo candidato
  const [addCandidateDialogOpen, setAddCandidateDialogOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    email: '',
    rol: 'candidato' // Por defecto es candidato
  });

  useEffect(() => {
    // Verificar si es admin
    const token = apiService.getAuthToken();
    console.log('Admin - Token encontrado:', !!token);
    if (!token) {
      console.log('Admin - No hay token, redirigiendo a login');
      navigate('/login');
      return;
    }
    
    console.log('Admin - Iniciando carga de datos...');
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('Admin - Iniciando carga de datos...');
      
      // Cargar logs de auditoría
      const auditResponse = await apiService.getAuditLogs(auditPage + 1, auditRowsPerPage);
      console.log('Admin - Respuesta logs de auditoría:', auditResponse);
      console.log('Admin - Tipo de auditResponse.data:', typeof auditResponse.data);
      console.log('Admin - Es array?', Array.isArray(auditResponse.data));
      console.log('Admin - Estructura completa:', JSON.stringify(auditResponse.data, null, 2));
      console.log('Admin - auditResponse.data.data existe?', auditResponse.data && typeof auditResponse.data === 'object' && 'data' in auditResponse.data);
      console.log('Admin - auditResponse.data.pagination:', auditResponse.data && typeof auditResponse.data === 'object' ? (auditResponse.data as any).pagination : 'No existe');
      
      if (auditResponse.success && auditResponse.data) {
        // Verificar que data sea un array o contenga data.data
        if (Array.isArray(auditResponse.data)) {
          setAuditLogs(auditResponse.data);
        } else if (auditResponse.data && typeof auditResponse.data === 'object' && 'data' in auditResponse.data && Array.isArray((auditResponse.data as any).data)) {
          setAuditLogs((auditResponse.data as any).data);
        } else if (auditResponse.data && typeof auditResponse.data === 'object' && 'logs' in auditResponse.data && Array.isArray((auditResponse.data as any).logs)) {
          setAuditLogs((auditResponse.data as any).logs);
        } else {
          console.warn('Admin - auditResponse.data no es un array:', auditResponse.data);
          setAuditLogs([]);
        }
        // Extraer total de paginación de la estructura correcta
        if (auditResponse.data && typeof auditResponse.data === 'object' && 'pagination' in auditResponse.data) {
          setAuditTotal((auditResponse.data as any).pagination.total || 0);
        } else {
          setAuditTotal(auditResponse.pagination?.total || 0);
        }
      }
      
      // Cargar dashboard admin
      const dashboardResponse = await apiService.getAdminDashboard();
      console.log('Admin - Respuesta dashboard admin:', dashboardResponse);
      if (dashboardResponse.success && dashboardResponse.data) {
        console.log('Admin - Dashboard data completo:', dashboardResponse.data);
        console.log('Admin - Statistics:', dashboardResponse.data.statistics);
        setDashboardData(dashboardResponse.data);
      }
      
      // Cargar candidatos
      await fetchCandidates();
      
    } catch (err: any) {
      console.error('Admin - Error cargando datos:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    try {
      // Validación básica
      if (!newCandidateForm.email.trim()) {
        setError('Por favor, ingresa el email del candidato');
        return;
      }

      // Aquí implementarías la llamada a la API para crear candidato
      console.log('Admin - Creando candidato:', {
        email: newCandidateForm.email,
        rol: newCandidateForm.rol
      });
      
      // Por ahora solo cerramos el dialog
      setAddCandidateDialogOpen(false);
      setNewCandidateForm({ email: '', rol: 'candidato' });
      // Recargar datos
      fetchAdminData();
    } catch (err: any) {
      setError('Error al crear candidato');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAuditPageChange = (event: unknown, newPage: number) => {
    setAuditPage(newPage);
    fetchAdminData();
  };

  const handleAuditRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuditRowsPerPage(parseInt(event.target.value, 10));
    setAuditPage(0);
    fetchAdminData();
  };

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const response = await apiService.getCandidates();
      console.log('Admin - Respuesta candidatos:', response);
      if (response.success && response.data) {
        console.log('Admin - Candidatos recibidos:', response.data.politicians);
        setCandidates(response.data.politicians || []);
      }
    } catch (err: any) {
      console.error('Error cargando candidatos:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'black', mb: 4 }}>
        Panel de Administración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Dashboard" />
          <Tab label="Logs de Auditoría" />
          <Tab label="Gestión de Políticos" />
          <Tab label="Lista de Candidatos" />
        </Tabs>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
               <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                 <Card sx={{ backgroundColor: 'black', color: 'white' }}>
                   <CardContent>
                     <Typography variant="h3" component="div" align="center">
                       {dashboardData?.statistics?.totalPoliticians || 0}
                     </Typography>
                     <Typography variant="body1" align="center">
                       Total de Políticos
                     </Typography>
                   </CardContent>
                 </Card>
               </Box>
               <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                 <Card sx={{ backgroundColor: 'black', color: 'white' }}>
                   <CardContent>
                     <Typography variant="h3" component="div" align="center">
                       {dashboardData?.statistics?.totalReferidos || 0}
                     </Typography>
                     <Typography variant="body1" align="center">
                       Total de Referidos
                     </Typography>
                   </CardContent>
                 </Card>
               </Box>
               <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                 <Card sx={{ backgroundColor: 'black', color: 'white' }}>
                   <CardContent>
                     <Typography variant="h3" component="div" align="center">
                       {dashboardData?.statistics?.totalCandidates || 0}
                     </Typography>
                     <Typography variant="body1" align="center">
                       Total de Candidatos
                     </Typography>
                   </CardContent>
                 </Card>
               </Box>
               <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                 <Card sx={{ backgroundColor: 'black', color: 'white' }}>
                   <CardContent>
                     <Typography variant="h3" component="div" align="center">
                       {dashboardData?.statistics?.totalAuditLogs || 0}
                     </Typography>
                     <Typography variant="body1" align="center">
                       Logs de Auditoría
                     </Typography>
                   </CardContent>
                 </Card>
               </Box>
             </Box>
          )}
        </TabPanel>

        {/* Logs de Auditoría Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Logs de Auditoría del Sistema
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'black' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acción</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entidad</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                                 {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                   auditLogs.map((log) => (
                     <TableRow key={log.uuid || log.id}>
                       <TableCell>{log.action}</TableCell>
                       <TableCell>{log.entityType} - {log.entityId}</TableCell>
                       <TableCell>{log.userId}</TableCell>
                       <TableCell>
                         {new Date(log.timestamp).toLocaleString()}
                       </TableCell>
                       <TableCell>{log.ipAddress || '-'}</TableCell>
                     </TableRow>
                   ))
                 ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {Array.isArray(auditLogs) ? 'No hay logs de auditoría' : 'Cargando logs...'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={auditTotal}
            rowsPerPage={auditRowsPerPage}
            page={auditPage}
            onPageChange={handleAuditPageChange}
            onRowsPerPageChange={handleAuditRowsPerPageChange}
          />
        </TabPanel>

        {/* Gestión de Políticos Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gestión de Políticos
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setError(''); // Limpiar error anterior
                setNewCandidateForm({ email: '', rol: 'candidato' }); // Limpiar formulario
                setAddCandidateDialogOpen(true);
              }}
              sx={{ backgroundColor: 'black' }}
            >
              Crear Nuevo Candidato
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'gray' }}>
            Aquí puedes crear nuevos candidatos o representantes agregando solo su email. Ellos podrán acceder al sistema mediante OAuth y completar su información personal.
          </Typography>
        </TabPanel>

        {/* Lista de Candidatos Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lista de Candidatos
            </Typography>
          </Box>
          
          {candidatesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'black' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Edad</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sexo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay candidatos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate) => (
                      <TableRow key={candidate.uuid}>
                        <TableCell>
                          {candidate.nombres} {candidate.apellidos}
                        </TableCell>
                                                 <TableCell>
                           {candidate.email ? candidate.email : (
                             <Typography variant="body2" sx={{ color: 'gray', fontStyle: 'italic' }}>
                               Sin email
                             </Typography>
                           )}
                         </TableCell>
                        <TableCell>{candidate.edad || '-'}</TableCell>
                        <TableCell>{candidate.sexo || '-'}</TableCell>
                        <TableCell>
                          {candidate.isCandidato ? 'Candidato' : 'Representante'}
                        </TableCell>
                                                 <TableCell>
                           <Box
                             sx={{
                               backgroundColor: 'green',
                               color: 'white',
                               px: 1,
                               py: 0.5,
                               borderRadius: 1,
                               fontSize: '0.75rem'
                             }}
                           >
                             Activo
                           </Box>
                         </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Dialog para crear nuevo candidato */}
      <Dialog open={addCandidateDialogOpen} onClose={() => setAddCandidateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Candidato</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Email del Candidato"
              type="email"
              value={newCandidateForm.email}
              onChange={(e) => setNewCandidateForm(prev => ({ ...prev, email: e.target.value }))}
              required
              helperText="Email que usará para acceder al sistema y completar su información"
            />
            <TextField
              select
              fullWidth
              label="Rol"
              value={newCandidateForm.rol}
              onChange={(e) => setNewCandidateForm(prev => ({ ...prev, rol: e.target.value }))}
              helperText="Tipo de rol que tendrá en el sistema"
            >
              <MenuItem value="candidato">Candidato</MenuItem>
              <MenuItem value="representante">Representante</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCandidateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddCandidate} variant="contained" sx={{ backgroundColor: 'black' }}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
