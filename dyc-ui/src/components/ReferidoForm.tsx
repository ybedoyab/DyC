import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import type { LoginFormData, Politician } from '../types/index';
import apiService from '../services/api';

interface ReferidoFormProps {
  onSuccess?: () => void;
}

const ReferidoForm: React.FC<ReferidoFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    nombres: '',
    apellidos: '',
    email: '',
    numeroTelefono: '',
    documentoIdentidad: '',
    candidatoReferente: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [candidates, setCandidates] = useState<Politician[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Cargar candidatos al montar el componente
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const response = await apiService.getCandidates();
        
                 if (response.success && response.data) {
           // La respuesta tiene la estructura: { politicians: [...], pagination: {...} }
           const politicians = response.data.politicians || [];
           // Asegurarse de que politicians sea un array
           if (Array.isArray(politicians)) {
             setCandidates(politicians);
           } else {
             console.error('La respuesta no contiene un array de políticos válido:', politicians);
             setCandidates([]);
           }
         }
      } catch (err) {
        console.error('Error cargando candidatos:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.createReferido(formData);
      
      if (response.success) {
        setSuccess('¡Registro exitoso! Gracias por tu apoyo al partido Dignidad y Compromiso.');
        setFormData({
          nombres: '',
          apellidos: '',
          email: '',
          numeroTelefono: '',
          documentoIdentidad: '',
          candidatoReferente: ''
        });
        onSuccess?.();
      } else {
        setError(response.error || 'Error al registrar el referido');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.nombres.trim() !== '' &&
      formData.apellidos.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.documentoIdentidad.trim() !== '' &&
      formData.candidatoReferente.trim() !== ''
    );
  };

  // Helper function para obtener el ID único del candidato
  const getCandidateId = (candidate: Politician): string => {
    return candidate.id || candidate.uuid || '';
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ color: 'black' }}>
        Registro de Apoyo
      </Typography>
      
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3, color: 'gray' }}>
        Únete al partido Dignidad y Compromiso. Completa el formulario para registrar tu apoyo.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Nombres *"
                value={formData.nombres}
                onChange={handleInputChange('nombres')}
                required
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Apellidos *"
                value={formData.apellidos}
                onChange={handleInputChange('apellidos')}
                required
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Número de Teléfono"
                value={formData.numeroTelefono}
                onChange={handleInputChange('numeroTelefono')}
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="Documento de Identidad *"
              value={formData.documentoIdentidad}
              onChange={handleInputChange('documentoIdentidad')}
              required
              variant="outlined"
              helperText="Cédula, DNI, Pasaporte, etc."
            />
          </Box>
          
          <Box>
            <FormControl fullWidth required>
              <InputLabel>Candidato/Representante que te refirió *</InputLabel>
                             <Select
                 value={formData.candidatoReferente || ''}
                 onChange={(e) => {
                   const selectedValue = e.target.value;
                   setFormData(prev => ({
                     ...prev,
                     candidatoReferente: selectedValue
                   }));
                 }}
                 label="Candidato/Representante que te refirió *"
                 disabled={loadingCandidates}
               >
                                 {loadingCandidates ? (
                   <MenuItem disabled>
                     <CircularProgress size={20} />
                     Cargando candidatos...
                   </MenuItem>
                 ) : !Array.isArray(candidates) || candidates.length === 0 ? (
                   <MenuItem disabled>No hay candidatos disponibles</MenuItem>
                 ) : (
                   [
                     <MenuItem key="default" value="">
                       <em>Selecciona un candidato/representante</em>
                     </MenuItem>,
                     ...candidates.map((candidate) => (
                       <MenuItem key={getCandidateId(candidate)} value={getCandidateId(candidate)}>
                         {candidate.nombres} {candidate.apellidos} - {candidate.isCandidato ? 'Candidato' : 'Representante'}
                       </MenuItem>
                     ))
                   ]
                 )}
              </Select>
                             <Typography variant="caption" sx={{ color: 'gray', mt: 0.5 }}>
                 Selecciona el candidato o representante que te invitó a apoyar al partido
               </Typography>
               <Typography variant="caption" sx={{ color: 'blue', mt: 0.5 }}>
                 Valor seleccionado: {formData.candidatoReferente || 'Ninguno'}
               </Typography>
            </FormControl>
          </Box>
          
          <Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid() || loading}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'gray.800'
                },
                py: 1.5
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Registrar Apoyo'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReferidoForm;
