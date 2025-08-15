import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import ReferidoForm from '../components/ReferidoForm';
import Statistics from '../components/Statistics';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleFormSuccess = () => {
    // Opcional: mostrar mensaje de éxito o redirigir
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'black', 
          color: 'white', 
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Dignidad y Compromiso
          </Typography>
          
          {isAuthenticated && (
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 2, color: 'gray.300' }}>
              ¡Bienvenido, {user?.nombres} {user?.apellidos}!
            </Typography>
          )}
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Un partido político comprometido con el futuro de nuestro país
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Únete a nosotros en la construcción de una sociedad más justa, 
            transparente y comprometida con el bienestar de todos los ciudadanos.
          </Typography>
          
          {!isAuthenticated ? (
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                backgroundColor: 'white', 
                color: 'black',
                '&:hover': {
                  backgroundColor: 'gray.200'
                }
              }}
            >
              Iniciar Sesión
            </Button>
          ) : (
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                backgroundColor: 'white', 
                color: 'black',
                '&:hover': {
                  backgroundColor: 'gray.200'
                }
              }}
            >
              Ir al Dashboard
            </Button>
          )}
        </Container>
      </Box>

      {/* Contenido Principal */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Formulario de Registro */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'black', textAlign: 'center' }}>
                Únete a Nuestro Partido
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'gray' }}>
                Completa el formulario para registrar tu apoyo al partido Dignidad y Compromiso. 
                Tu voz es importante para nosotros.
              </Typography>
            </Box>
            <ReferidoForm onSuccess={handleFormSuccess} />
          </Grid>

          {/* Información del Partido */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'black', textAlign: 'center' }}>
                Sobre Nuestro Partido
              </Typography>
            </Box>
            
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
                Nuestra Misión
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'gray' }}>
                Trabajamos incansablemente para construir un país donde la dignidad humana 
                sea el centro de todas las decisiones políticas y donde el compromiso 
                con la justicia social sea nuestra prioridad.
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
                Nuestros Valores
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'gray' }}>
                • <strong>Dignidad:</strong> Respeto absoluto por los derechos humanos<br/>
                • <strong>Compromiso:</strong> Dedicación total a nuestras promesas<br/>
                • <strong>Transparencia:</strong> Rendición de cuentas en todas nuestras acciones<br/>
                • <strong>Justicia:</strong> Igualdad de oportunidades para todos
              </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
                ¿Por qué unirte?
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'gray' }}>
                Al unirte a nuestro partido, te conviertes en parte de un movimiento 
                que busca transformar la política tradicional en una herramienta 
                real para el cambio social positivo.
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                sx={{ 
                  borderColor: 'black', 
                  color: 'black',
                  '&:hover': {
                    borderColor: 'gray.700',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                {isAuthenticated ? 'Ir al Dashboard' : 'Conoce más sobre nosotros'}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Estadísticas */}
        <Box sx={{ mt: 8 }}>
          <Statistics />
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
