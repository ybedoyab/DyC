import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAdmin, isAuthenticated, isAdmin } = useAuth();
  
  const [adminMode, setAdminMode] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Verificar si ya está autenticado y redirigir
  React.useEffect(() => {
    console.log('Login - Usuario autenticado:', isAuthenticated);
    console.log('Login - Es admin:', isAdmin);
    
    if (isAuthenticated) {
      if (isAdmin) {
        console.log('Usuario es admin, redirigiendo a /admin');
        navigate('/admin');
      } else {
        console.log('Usuario es político, redirigiendo al dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Iniciando OAuth con Google...');
      await apiService.initiateGoogleOAuth();
      console.log('OAuth iniciado, redirigiendo a Google...');
    } catch (err) {
      console.error('Error al iniciar OAuth:', err);
      setError('Error al iniciar OAuth con Google');
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validación básica
    if (!adminCredentials.username.trim() || !adminCredentials.password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('Login - Intentando login admin con:', adminCredentials.username);
      const response = await apiService.adminLogin(
        adminCredentials.username,
        adminCredentials.password
      );

      console.log('Login - Respuesta del servidor:', response);

      if (response.success && response.data?.token) {
        console.log('Login - Login exitoso, redirigiendo a /admin');
        // Usar loginAdmin en lugar de setAuthToken directamente
        loginAdmin(response.data.admin, response.data.token);
        navigate('/admin');
      } else {
        setError(response.message || 'Credenciales inválidas');
      }
    } catch (err: any) {
      console.error('Login - Error en login admin:', err);
      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Intenta nuevamente.');
      } else {
        setError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'username' | 'password') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdminCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'black', mb: 4 }}>
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!adminMode ? (
          // Modo OAuth para políticos
          <Box>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: 'gray' }}>
              Acceso para Candidatos y Representantes
            </Typography>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGoogleOAuth}
              disabled={loading}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                py: 1.5,
                mb: 3,
                '&:hover': {
                  backgroundColor: 'gray.800'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Continuar con Google'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                O
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setAdminMode(true)}
              sx={{
                borderColor: 'black',
                color: 'black',
                '&:hover': {
                  borderColor: 'gray.700',
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Acceso Administrativo
            </Button>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                ¿No tienes acceso? Contacta al administrador del sistema.
              </Typography>
            </Box>
          </Box>
        ) : (
          // Modo Admin
          <Box>
                         <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: 'gray' }}>
               Acceso Administrativo
             </Typography>
             <Typography variant="body2" align="center" sx={{ mb: 3, color: 'gray', fontStyle: 'italic' }}>
               Usuario: admin | Contraseña: admin
             </Typography>

            <Box component="form" onSubmit={handleAdminLogin}>
              <TextField
                fullWidth
                label="Usuario"
                value={adminCredentials.username}
                onChange={handleInputChange('username')}
                required
                variant="outlined"
                error={error && !adminCredentials.username.trim()}
                helperText={error && !adminCredentials.username.trim() ? 'Usuario es requerido' : ''}
                inputProps={{
                  autoComplete: 'username'
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={adminCredentials.password}
                onChange={handleInputChange('password')}
                required
                variant="outlined"
                error={error && !adminCredentials.password.trim()}
                helperText={error && !adminCredentials.password.trim() ? 'Contraseña es requerida' : ''}
                inputProps={{
                  autoComplete: 'current-password'
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  py: 1.5,
                  mb: 3,
                  '&:hover': {
                    backgroundColor: 'gray.800'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Iniciar Sesión Admin'
                )}
              </Button>
            </Box>

            <Button
              fullWidth
              variant="text"
              onClick={() => setAdminMode(false)}
              sx={{ color: 'gray' }}
            >
              Volver a OAuth
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{ color: 'gray' }}
          >
            Volver al inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
