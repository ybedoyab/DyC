import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, admin, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  // Debug logs
  console.log('Navbar - user:', user);
  console.log('Navbar - admin:', admin);
  console.log('Navbar - isAuthenticated:', isAuthenticated);
  console.log('Navbar - isAdmin:', isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'black' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          DYC - Dignidad y Compromiso
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {(user?.fotoPerfil || admin?.fotoPerfil) && (
                  <Avatar 
                    src={user?.fotoPerfil || admin?.fotoPerfil} 
                    alt={isAdmin ? admin?.username : `${user?.nombres} ${user?.apellidos}`}
                    sx={{ width: 32, height: 32 }}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {isAdmin ? admin?.username : `${user?.nombres} ${user?.apellidos}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'gray.300', fontSize: '0.7rem' }}>
                    {isAdmin ? 'Administrador' : (user?.rol || (user?.isCandidato ? 'Candidato' : 'Representante'))}
                  </Typography>
                </Box>
              </Box>
              <Button 
                color="inherit" 
                onClick={isAdmin ? () => navigate('/admin') : handleDashboard}
                sx={{ color: 'white' }}
              >
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ color: 'white' }}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={handleLogin}
              sx={{ color: 'white' }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
