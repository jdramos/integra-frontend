import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';

import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../auth/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState('');
  const [jobLocation, setJobLocation] = useState('');

  const isJobsPage = location.pathname === '/jobs';

  const goHomeByRole = () => {
    if (user?.role === 'COMPANY_ADMIN') navigate('/company');
    else if (user?.role === 'CANDIDATE') navigate('/feed');
    else if (user?.role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (q.trim()) params.set('q', q.trim());
    if (jobLocation.trim()) params.set('location', jobLocation.trim());

    navigate(`/jobs?${params.toString()}`);
  };

  const navButtonSx = {
    textTransform: 'none',
    fontWeight: 800,
    borderRadius: 3,
    color: '#334155',
    '&:hover': {
      bgcolor: 'rgba(11,102,195,0.08)',
      color: '#0B66C3'
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#F8FAFC">
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 72 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={goHomeByRole}
              sx={{ cursor: 'pointer' }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #0B66C3, #084f9e)',
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  boxShadow: '0 8px 18px rgba(11,102,195,0.22)'
                }}
              >
                RH
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={900} color="primary.main" lineHeight={1}>
                  Integra RH
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role === 'COMPANY_ADMIN'
                    ? 'Panel empresa'
                    : user?.role === 'CANDIDATE'
                      ? 'Panel candidato'
                      : user?.role === 'ADMIN'
                        ? 'Panel administrador'
                        : 'Bolsa de empleo'}
                </Typography>
              </Box>
            </Stack>

            {isJobsPage && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <TextField
                  size="small"
                  placeholder="Cargo o empresa"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  sx={{
                    width: 240,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 999,
                      bgcolor: '#fff'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  size="small"
                  placeholder="Ubicación"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  sx={{
                    width: 220,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 999,
                      bgcolor: '#fff'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 800,
                    textTransform: 'none'
                  }}
                >
                  Buscar
                </Button>
              </Stack>
            )}

            <Box flex={1} />

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Button startIcon={<SearchIcon />} component={RouterLink} to="/jobs" sx={navButtonSx}>
                Empleos
              </Button>

              {user?.role === 'COMPANY_ADMIN' && (
                <>
                  <Button startIcon={<DashboardIcon />} component={RouterLink} to="/company" sx={navButtonSx}>
                    Panel
                  </Button>

                  <Button startIcon={<WorkIcon />} component={RouterLink} to="/company/jobs" sx={navButtonSx}>
                    Vacantes
                  </Button>

                  <Button startIcon={<PersonIcon />} component={RouterLink} to="/company/candidates" sx={navButtonSx}>
                    Candidatos
                  </Button>

                  <Button
                    startIcon={<ViewKanbanIcon />}
                    component={RouterLink}
                    to="/company/pipeline"
                    sx={navButtonSx}
                  >
                    Pipeline
                  </Button>


                  <Button startIcon={<EventIcon />} component={RouterLink} to="/company/interviews" sx={navButtonSx}>
                    Entrevistas
                  </Button>

                  <Button startIcon={<BookmarkIcon />} component={RouterLink} to="/company/saved-candidates" sx={navButtonSx}>
                    Guardados
                  </Button>

                  <Button startIcon={<BusinessIcon />} component={RouterLink} to="/company/profile" sx={navButtonSx}>
                    Empresa
                  </Button>
                </>
              )}

              {user?.role === 'CANDIDATE' && (
                <>
                  <Button startIcon={<WorkIcon />} component={RouterLink} to="/candidate/applications" sx={navButtonSx}>
                    Mis postulaciones
                  </Button>

                  <Button startIcon={<PersonIcon />} component={RouterLink} to="/candidate/profile" sx={navButtonSx}>
                    Perfil
                  </Button>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <Button startIcon={<AdminPanelSettingsIcon />} component={RouterLink} to="/admin" sx={navButtonSx}>
                  Admin
                </Button>
              )}

              {!user ? (
                <>
                  <Button component={RouterLink} to="/login" sx={navButtonSx}>
                    Ingresar
                  </Button>

                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register-company"
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 900
                    }}
                  >
                    Publicar empleo
                  </Button>
                </>
              ) : (
                <>
                  <Stack direction="row" alignItems="center" spacing={1} ml={1}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#0B66C3' }}>
                      {user.name?.charAt(0)}
                    </Avatar>

                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                      {user.name}
                    </Typography>
                  </Stack>

                  <IconButton onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: isJobsPage ? 0 : 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}