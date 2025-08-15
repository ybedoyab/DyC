import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { AuthUser } from '../types/index';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('OAuthSuccess - useEffect ejecutándose');
    console.log('URL completa:', window.location.href);
    console.log('Search params:', searchParams.toString());
    
    const token = searchParams.get('token');
    const politician = searchParams.get('politician');
    
    console.log('OAuthSuccess - Token:', token);
    console.log('OAuthSuccess - Politician:', politician);
    
    // Evitar bucle infinito - si ya estamos en dashboard, no procesar OAuth
    if (window.location.pathname === '/dashboard') {
      console.log('OAuthSuccess - Ya en dashboard, no procesando OAuth');
      return;
    }
    
    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      console.log('OAuthSuccess - Usuario ya autenticado, redirigiendo al dashboard');
      navigate('/dashboard');
      return;
    }
    
    if (token && politician) {
      try {
        const politicianData = JSON.parse(decodeURIComponent(politician));
        console.log('OAuthSuccess - Datos del político recibidos:', politicianData);
        
        // Transformar los datos para que coincidan con AuthUser
        const authUser: AuthUser = {
          id: politicianData.id,
          uuid: politicianData.uuid,
          email: politicianData.email,
          isCandidato: politicianData.isCandidato,
          type: 'politician',
          nombres: politicianData.nombres,
          apellidos: politicianData.apellidos,
          nombreCompleto: politicianData.nombreCompleto,
          rol: politicianData.rol,
          fotoPerfil: politicianData.fotoPerfil
        };
        
        console.log('OAuthSuccess - Usuario autenticado:', authUser);
        login(authUser, token);
        
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          console.log('OAuthSuccess - Redirigiendo al dashboard');
          navigate('/dashboard');
        }, 1000);
        
      } catch (err) {
        console.error('OAuthSuccess - Error al procesar la autenticación OAuth:', err);
        navigate('/login?error=oauth_error');
      }
    } else {
      console.error('OAuthSuccess - Faltan parámetros token o politician');
      navigate('/login?error=missing_params');
    }
  }, [searchParams, login, navigate, isAuthenticated]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'black', mb: 3 }}>
          Autenticación Exitosa
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={60} sx={{ color: 'black' }} />
          
          <Typography variant="h6" sx={{ color: 'gray' }}>
            Procesando tu inicio de sesión...
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'gray' }}>
            Serás redirigido al dashboard en unos segundos.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OAuthSuccess;
