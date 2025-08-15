import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import type { Referido } from '../types/index';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Estados para edición de referidos
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReferido, setEditingReferido] = useState<Referido | null>(null);
  const [editForm, setEditForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    numeroTelefono: '',
    documentoIdentidad: ''
  });

  // Estados para edición de perfil personal
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombres: '',
    apellidos: '',
    edad: '',
    sexo: '',
    numeroTelefono: '',
    documentoIdentidad: '',
    biografia: '',
    fotoPerfil: null as File | null,
    fotoCuerpoCompleto: null as File | null,
    fotoPortada: null as File | null
  });
  
  // Estados para preview de imágenes
  const [imagePreviews, setImagePreviews] = useState({
    fotoPerfil: '',
    fotoCuerpoCompleto: '',
    fotoPortada: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReferido, setDeletingReferido] = useState<Referido | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchReferidos();
  }, [isAuthenticated, navigate, page, rowsPerPage]);

  const fetchReferidos = async () => {
    try {
      setLoading(true);
      const response = user?.isCandidato 
        ? await apiService.getMyReferidos(page + 1, rowsPerPage)
        : await apiService.getRepresentativeDashboard();
      
      if (response.success && response.data) {
        if (user?.isCandidato) {
          // Para candidatos: usar referidos individuales
          setReferidos(response.data.referidos || []);
          setTotal(response.pagination?.total || 0);
        } else {
          // Para representantes: usar dashboard extendido
          setReferidos(response.data.referidosPorPolitico || []);
          setTotal(response.data.estadisticasGenerales?.totalReferidos || 0);
        }
      } else {
        setError(response.error || 'Error al cargar referidos');
      }
    } catch (err: any) {
      console.error('Error cargando referidos:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (referido: Referido) => {
    setEditingReferido(referido);
    setEditForm({
      nombres: referido.nombres,
      apellidos: referido.apellidos,
      email: referido.email,
      numeroTelefono: referido.numeroTelefono || '',
      documentoIdentidad: referido.documentoIdentidad
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingReferido) return;

    try {
      const response = await apiService.updateReferido(editingReferido.uuid, editForm);
      
      if (response.success) {
        setEditDialogOpen(false);
        setEditingReferido(null);
        fetchReferidos();
      } else {
        setError(response.error || 'Error al actualizar referido');
      }
    } catch (err: any) {
      setError('Error de conexión');
    }
  };

  const handleDelete = (referido: Referido) => {
    setDeletingReferido(referido);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReferido) return;

    try {
      const response = await apiService.deleteReferido(deletingReferido.uuid);
      
      if (response.success) {
        setDeleteDialogOpen(false);
        setDeletingReferido(null);
        fetchReferidos();
      } else {
        setError(response.error || 'Error al eliminar referido');
      }
    } catch (err: any) {
      setError('Error de conexión');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Funciones para manejar perfil personal
  const handleImageUpload = (field: string, file: File) => {
    if (file) {
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [field]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      // Actualizar el formulario
      setProfileForm(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleImageRemove = (field: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: null
    }));
    setImagePreviews(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleEditProfile = async () => {
    try {
      setProfileLoading(true);
      setError('');
      
      // Debug: verificar token y usuario
      const token = apiService.getAuthToken();
      console.log('Dashboard - Token encontrado:', !!token);
      console.log('Dashboard - Usuario del contexto:', user);
      console.log('Dashboard - UUID del usuario:', user?.uuid);
      
      // Cargar perfil completo del usuario
      let response;
      if (user?.uuid) {
        // Si tenemos UUID, usar endpoint específico
        console.log('Dashboard - Usando endpoint con UUID:', user.uuid);
        response = await apiService.getMyProfileByUUID(user.uuid);
      } else {
        // Si no tenemos UUID, usar endpoint de perfil
        console.log('Dashboard - Usando endpoint de perfil');
        response = await apiService.getMyProfile();
      }
      console.log('Dashboard - Respuesta getMyProfile:', response);
      
      if (response.success && response.data) {
        const profile = response.data;
        console.log('Dashboard - Perfil cargado:', profile);
        setProfileForm({
          nombres: profile.nombres || '',
          apellidos: profile.apellidos || '',
          edad: profile.edad?.toString() || '',
          sexo: profile.sexo || '',
          numeroTelefono: profile.numeroTelefono || '',
          documentoIdentidad: profile.documentoIdentidad || '',
          biografia: profile.biografia || '',
          fotoPerfil: null,
          fotoCuerpoCompleto: null,
          fotoPortada: null
        });
        
        // Cargar previews de imágenes existentes
        setImagePreviews({
          fotoPerfil: profile.fotoPerfil || '',
          fotoCuerpoCompleto: profile.fotoCuerpoCompleto || '',
          fotoPortada: profile.fotoPortada || ''
        });
        setProfileDialogOpen(true);
      } else {
        console.error('Dashboard - Error en respuesta:', response);
        setError('Error al cargar perfil');
      }
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError('Error de conexión al cargar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    try {
      setProfileLoading(true);
      setError('');

              // Crear FormData para enviar archivos
        const formData = new FormData();
        formData.append('nombres', profileForm.nombres.trim());
        formData.append('apellidos', profileForm.apellidos.trim());
        if (profileForm.edad) formData.append('edad', profileForm.edad);
        if (profileForm.sexo) formData.append('sexo', profileForm.sexo);
        if (profileForm.numeroTelefono) formData.append('numeroTelefono', profileForm.numeroTelefono.trim());
        if (profileForm.documentoIdentidad) formData.append('documentoIdentidad', profileForm.documentoIdentidad.trim());
        if (profileForm.biografia) formData.append('biografia', profileForm.biografia.trim());
        
        // Agregar archivos si existen
        if (profileForm.fotoPerfil) formData.append('fotoPerfil', profileForm.fotoPerfil);
        if (profileForm.fotoCuerpoCompleto) formData.append('fotoCuerpoCompleto', profileForm.fotoCuerpoCompleto);
        if (profileForm.fotoPortada) formData.append('fotoPortada', profileForm.fotoPortada);

              const response = await apiService.updateMyProfile(formData);
      
             if (response.success) {
         setProfileDialogOpen(false);
         // Actualizar el contexto del usuario con los nuevos datos
         // Por ahora recargamos la página para actualizar el contexto
         window.location.reload();
       } else {
        setError(response.error || 'Error al actualizar perfil');
      }
    } catch (err: any) {
      setError('Error de conexión');
    } finally {
      setProfileLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'black', mb: 4 }}>
        Dashboard - {user?.isCandidato ? 'Mis Referidos' : 'Todos los Referidos'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Información del usuario */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'black' }}>
              {user?.nombres} {user?.apellidos}
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              {user?.isCandidato ? 'Candidato' : 'Representante'}
            </Typography>
            {user?.edad && (
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Edad: {user.edad} años
              </Typography>
            )}
            {user?.numeroTelefono && (
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Tel: {user.numeroTelefono}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                         <Button
               variant="outlined"
               onClick={handleEditProfile}
               disabled={profileLoading}
               sx={{ borderColor: 'black', color: 'black' }}
             >
               {profileLoading ? 'Cargando...' : 'Editar Perfil'}
             </Button>
            <Box>
              <Typography variant="h4" sx={{ color: 'black', fontWeight: 'bold' }}>
                {total}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Total de Referidos
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de referidos */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'black' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : referidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay referidos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                referidos.map((referido) => (
                  <TableRow key={referido.uuid}>
                    <TableCell>
                      {referido.nombres} {referido.apellidos}
                    </TableCell>
                    <TableCell>{referido.email}</TableCell>
                    <TableCell>{referido.numeroTelefono || '-'}</TableCell>
                    <TableCell>{referido.documentoIdentidad}</TableCell>
                    <TableCell>
                      {new Date(referido.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(referido)}
                        sx={{ color: 'black' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(referido)}
                        sx={{ color: 'red' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Referido</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={editForm.nombres}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nombres: e.target.value }))}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={editForm.apellidos}
                  onChange={(e) => setEditForm(prev => ({ ...prev, apellidos: e.target.value }))}
                  required
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={editForm.numeroTelefono}
              onChange={(e) => setEditForm(prev => ({ ...prev, numeroTelefono: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Documento de Identidad"
              value={editForm.documentoIdentidad}
              onChange={(e) => setEditForm(prev => ({ ...prev, documentoIdentidad: e.target.value }))}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{ backgroundColor: 'black' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar a {deletingReferido?.nombres} {deletingReferido?.apellidos}?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición de perfil personal */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil Personal</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={profileForm.nombres}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, nombres: e.target.value }))}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={profileForm.apellidos}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, apellidos: e.target.value }))}
                  required
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Edad"
                  type="number"
                  value={profileForm.edad}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, edad: e.target.value }))}
                  inputProps={{ min: 18, max: 120 }}
                  helperText="Entre 18 y 120 años"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  select
                  fullWidth
                  label="Sexo"
                  value={profileForm.sexo}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, sexo: e.target.value }))}
                >
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="no binario">No Binario</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </TextField>
              </Box>
            </Box>
                         <TextField
               fullWidth
               label="Teléfono"
               value={profileForm.numeroTelefono}
               onChange={(e) => setProfileForm(prev => ({ ...prev, numeroTelefono: e.target.value }))}
               helperText="Número de teléfono (opcional)"
             />
             <TextField
               fullWidth
               label="Documento de Identidad"
               value={profileForm.documentoIdentidad}
               onChange={(e) => setProfileForm(prev => ({ ...prev, documentoIdentidad: e.target.value }))}
               helperText="Número de documento de identidad (opcional)"
             />
                         <TextField
               fullWidth
               label="Biografía"
               multiline
               rows={4}
               value={profileForm.biografia}
               onChange={(e) => setProfileForm(prev => ({ ...prev, biografia: e.target.value }))}
               helperText="Cuéntanos sobre ti (opcional)"
             />
             
             {/* Campos de fotos */}
             <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'black' }}>
               Fotos
             </Typography>
             
             {/* Foto de Perfil */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               <Typography variant="subtitle2" sx={{ color: 'gray' }}>
                 Foto de Perfil
               </Typography>
               <input
                 accept="image/*"
                 style={{ display: 'none' }}
                 id="fotoPerfil-input"
                 type="file"
                 onChange={(e) => handleImageUpload('fotoPerfil', e.target.files?.[0] || null)}
               />
               <label htmlFor="fotoPerfil-input">
                 <Button
                   variant="outlined"
                   component="span"
                   sx={{ borderColor: 'black', color: 'black' }}
                 >
                   Seleccionar Foto de Perfil
                 </Button>
               </label>
               {imagePreviews.fotoPerfil && (
                 <Box sx={{ mt: 1, position: 'relative', display: 'inline-block' }}>
                   <img
                     src={imagePreviews.fotoPerfil}
                     alt="Preview Foto de Perfil"
                     style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                   />
                   <IconButton
                     size="small"
                     onClick={() => handleImageRemove('fotoPerfil')}
                     sx={{
                       position: 'absolute',
                       top: -8,
                       right: -8,
                       backgroundColor: 'red',
                       color: 'white',
                       '&:hover': { backgroundColor: 'darkred' }
                     }}
                   >
                     ×
                   </IconButton>
                 </Box>
               )}
             </Box>
             
             {/* Foto de Cuerpo Completo */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               <Typography variant="subtitle2" sx={{ color: 'gray' }}>
                 Foto de Cuerpo Completo
               </Typography>
               <input
                 accept="image/*"
                 style={{ display: 'none' }}
                 id="fotoCuerpoCompleto-input"
                 type="file"
                 onChange={(e) => handleImageUpload('fotoCuerpoCompleto', e.target.files?.[0] || null)}
               />
               <label htmlFor="fotoCuerpoCompleto-input">
                 <Button
                   variant="outlined"
                   component="span"
                   sx={{ borderColor: 'black', color: 'black' }}
                 >
                   Seleccionar Foto de Cuerpo Completo
                 </Button>
               </label>
               {imagePreviews.fotoCuerpoCompleto && (
                 <Box sx={{ mt: 1, position: 'relative', display: 'inline-block' }}>
                   <img
                     src={imagePreviews.fotoCuerpoCompleto}
                     alt="Preview Foto de Cuerpo Completo"
                     style={{ maxWidth: '200px', maxHeight: '300px', objectFit: 'cover' }}
                   />
                   <IconButton
                     size="small"
                     onClick={() => handleImageRemove('fotoCuerpoCompleto')}
                     sx={{
                       position: 'absolute',
                       top: -8,
                       right: -8,
                       backgroundColor: 'red',
                       color: 'white',
                       '&:hover': { backgroundColor: 'darkred' }
                     }}
                   >
                     ×
                   </IconButton>
                 </Box>
               )}
             </Box>
             
             {/* Foto de Portada */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               <Typography variant="subtitle2" sx={{ color: 'black' }}>
                 Foto de Portada
               </Typography>
               <input
                 accept="image/*"
                 style={{ display: 'none' }}
                 id="fotoPortada-input"
                 type="file"
                 onChange={(e) => handleImageUpload('fotoPortada', e.target.files?.[0] || null)}
               />
               <label htmlFor="fotoPortada-input">
                 <Button
                   variant="outlined"
                   component="span"
                   sx={{ borderColor: 'black', color: 'black' }}
                 >
                   Seleccionar Foto de Portada
                 </Button>
               </label>
               {imagePreviews.fotoPortada && (
                 <Box sx={{ mt: 1, position: 'relative', display: 'inline-block' }}>
                   <img
                     src={imagePreviews.fotoPortada}
                     alt="Preview Foto de Portada"
                     style={{ maxWidth: '300px', maxHeight: '150px', objectFit: 'cover' }}
                   />
                   <IconButton
                     size="small"
                     onClick={() => handleImageRemove('fotoPortada')}
                     sx={{
                       position: 'absolute',
                       top: -8,
                       right: -8,
                       backgroundColor: 'red',
                       color: 'white',
                       '&:hover': { backgroundColor: 'darkred' }
                     }}
                   >
                     ×
                   </IconButton>
                 </Box>
               )}
             </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleProfileSubmit} 
            variant="contained" 
            sx={{ backgroundColor: 'black' }}
            disabled={profileLoading}
          >
            {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
