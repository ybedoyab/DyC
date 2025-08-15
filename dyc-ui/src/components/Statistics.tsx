import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import type { Statistics as StatisticsType } from '../types/index';
import apiService from '../services/api';

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStatistics();
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (err: any) {
      setError('Error de conexión al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!statistics || typeof statistics.totalPoliticians === 'undefined') {
    return null;
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ color: 'black', mb: 4 }}>
        Estadísticas del Partido
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Estadísticas principales */}
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ backgroundColor: 'black', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {statistics.totalPoliticians || 0}
              </Typography>
              <Typography variant="body1" align="center">
                Total de Políticos
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ backgroundColor: 'black', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {statistics.totalCandidates || 0}
              </Typography>
              <Typography variant="body1" align="center">
                Candidatos
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ backgroundColor: 'black', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {statistics.totalRepresentatives || 0}
              </Typography>
              <Typography variant="body1" align="center">
                Representantes
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ backgroundColor: 'black', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {statistics.totalReferidos || 0}
              </Typography>
              <Typography variant="body1" align="center">
                Total de Referidos
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Referidos por político */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
              Referidos por Político
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {statistics.referidosByPolitician && statistics.referidosByPolitician.length > 0 ? (
                statistics.referidosByPolitician.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < statistics.referidosByPolitician.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'black' }}>
                      {item.politicianName}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center', py: 2 }}>
                  No hay datos disponibles
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Referidos por mes */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
              Referidos por Mes
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {statistics.referidosByMonth && statistics.referidosByMonth.length > 0 ? (
                statistics.referidosByMonth.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < statistics.referidosByMonth.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'black' }}>
                      {item.month}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center', py: 2 }}>
                  No hay datos disponibles
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Statistics;
