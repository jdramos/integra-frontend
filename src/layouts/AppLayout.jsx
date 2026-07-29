import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import ReportIcon from '@mui/icons-material/Report';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MailIcon from '@mui/icons-material/Mail';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RedeemIcon from '@mui/icons-material/Redeem';
import GroupsIcon from '@mui/icons-material/Groups';

import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../auth/AuthContext';
import useCatalog from '../hooks/useCatalog';
import useColorMode from '../theme/ColorModeContext';
import NotificationCenter from '../components/notifications/NotificationCenter';
import useMessaging from '../realtime/MessagingContext';

const DRAWER_WIDTH = 248;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { labels: departments } = useCatalog('nicaragua_departments');
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const { unreadCount } = useMessaging() || {};

  const [q, setQ] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isJobsPage = location.pathname === '/jobs';

  React.useEffect(() => {
    if (!isJobsPage) return;
    const params = new URLSearchParams(location.search);
    setQ(params.get('q') || '');
    setJobLocation(params.get('location') || '');
  }, [isJobsPage, location.search]);

  const goHomeByRole = () => {
    if (['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'].includes(user?.role)) navigate('/company');
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

  const isActive = (to, exact = false) => location.pathname === to || (!exact && location.pathname.startsWith(`${to}/`));

  const hasPerm = (key) => Boolean(user?.is_super_admin) || (user?.permissions || []).includes(key);

  const navSections = [];

  navSections.push({
    items: [{ label: 'Empleos', icon: <SearchIcon />, to: '/jobs' }],
  });

  if (['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'].includes(user?.role)) {
    navSections.push({
      title: 'Panel empresa',
      items: [
        { label: 'Panel', icon: <DashboardIcon />, to: '/company' },
        { label: 'Vacantes', icon: <WorkIcon />, to: '/company/jobs' },
        { label: 'Candidatos', icon: <PersonIcon />, to: '/company/candidates' },
        { label: 'Pipeline', icon: <ViewKanbanIcon />, to: '/company/pipeline' },
        { label: 'Entrevistas', icon: <EventIcon />, to: '/company/interviews' },
        { label: 'Guardados', icon: <BookmarkIcon />, to: '/company/saved-candidates' },
        { label: 'Mensajes', icon: <MailIcon />, to: '/company/messages', badge: unreadCount },
        { label: 'Empresa', icon: <BusinessIcon />, to: '/company/profile' },
      ],
    });
    if (Boolean(user?.personnel_payroll_enabled) && ['COMPANY', 'COMPANY_ADMIN'].includes(user?.role)) {
      navSections.push({
        title: 'Personal y planilla',
        items: [
          { label: 'Resumen del módulo', icon: <DashboardIcon />, to: '/company/personnel', exact: true },
          { label: 'Colaboradores', icon: <GroupsIcon />, to: '/company/personnel/employees' },
          { label: 'Vacaciones y permisos', icon: <EventIcon />, to: '/company/personnel/leave' },
          { label: 'Planillas', icon: <AccountBalanceWalletIcon />, to: '/company/personnel/payroll' },
          { label: 'Documentos laborales', icon: <DescriptionIcon />, to: '/company/personnel/documents' },
          { label: 'Asistencia', icon: <AccessTimeIcon />, to: '/company/personnel/attendance' },
          { label: 'Prestaciones', icon: <RedeemIcon />, to: '/company/personnel/benefits' },
          { label: 'Liquidaciones', icon: <DescriptionIcon />, to: '/company/personnel/settlements' },
          { label: 'Configuración', icon: <SettingsIcon />, to: '/company/personnel/settings' },
          { label: 'Reportes de nómina', icon: <ReportIcon />, to: '/company/personnel/reports' },
        ],
      });
    }
  }

  if (user?.role === 'CANDIDATE') {
    navSections.push({
      title: 'Panel candidato',
      items: [
        { label: 'Mis postulaciones', icon: <WorkIcon />, to: '/candidate/applications' },
        { label: 'Mensajes', icon: <MailIcon />, to: '/candidate/messages', badge: unreadCount },
        { label: 'Perfil', icon: <PersonIcon />, to: '/candidate/profile' },
      ],
    });
  }

  if (user?.role === 'ADMIN') {
    const adminItems = [{ label: 'Admin', icon: <AdminPanelSettingsIcon />, to: '/admin' }];

    if (hasPerm('billing')) adminItems.push({ label: 'Cobros', icon: <AccountBalanceWalletIcon />, to: '/admin/billing' });
    if (hasPerm('catalogs')) adminItems.push({ label: 'Catálogos', icon: <ListAltIcon />, to: '/admin/catalogs' });
    if (hasPerm('plans')) adminItems.push({ label: 'Planes', icon: <WorkspacePremiumIcon />, to: '/admin/plans' });
    if (hasPerm('jobs')) adminItems.push({ label: 'Vacantes', icon: <WorkIcon />, to: '/admin/jobs' });
    if (hasPerm('reports')) adminItems.push({ label: 'Reportes', icon: <ReportIcon />, to: '/admin/reports' });
    if (hasPerm('audit')) adminItems.push({ label: 'Auditoría', icon: <HistoryIcon />, to: '/admin/audit' });
    if (hasPerm('system')) adminItems.push({ label: 'Sistema', icon: <MonitorHeartIcon />, to: '/admin/system' });
    if (hasPerm('admins')) adminItems.push({ label: 'Administradores', icon: <PersonIcon />, to: '/admin/staff' });

    navSections.push({ title: 'Panel administrador', items: adminItems });
  }

  if (user) {
    navSections.push({
      items: [{ label: 'Cuenta', icon: <SettingsIcon />, to: '/account' }],
    });
  }

  const drawerContent = (
    <Box role="presentation" sx={{ width: DRAWER_WIDTH, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />

      {user && (
        <>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#0B66C3' }}>
              {user.name?.charAt(0)}
            </Avatar>

            <Box minWidth={0}>
              <Typography variant="body2" fontWeight={800} noWrap>
                {user.name}
              </Typography>

              {user.company_name && (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {user.company_name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider />
        </>
      )}

      <Box sx={{ overflowY: 'auto', flex: 1, py: 1 }}>
        {navSections.map((section, index) => (
          <Box key={section.title || index} sx={{ mb: 1 }}>
            {section.title && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
                sx={{ px: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {section.title}
              </Typography>
            )}

            <List dense disablePadding>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  selected={isActive(item.to, item.exact)}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.25,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                    },
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>
                    {item.badge ? (
                      <Badge color="error" badgeContent={item.badge} max={99}>
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
                  />
                </ListItemButton>
              ))}
            </List>

            {index < navSections.length - 1 && <Divider sx={{ my: 1, mx: 2 }} />}
          </Box>
        ))}
      </Box>

      {user && (
        <>
          <Divider />
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ m: 1.5, justifyContent: 'flex-start', textTransform: 'none', fontWeight: 800, color: 'text.secondary' }}
          >
            Cerrar sesión
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar disableGutters sx={{ gap: 1.5, minHeight: 68, px: { xs: 1.5, md: 2.5 } }}>
          {user && (
            <IconButton
              onClick={() => setMobileOpen((prev) => !prev)}
              sx={{ display: { md: 'none' } }}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>
          )}

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

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" fontWeight={900} color="primary.main" lineHeight={1}>
                Integra RH
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'].includes(user?.role)
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
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}
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
                    bgcolor: 'background.paper'
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
                select
                size="small"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                    bgcolor: 'background.paper'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">Ubicación</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </TextField>

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
            <Tooltip title={mode === 'dark' ? 'Usar modo claro' : 'Usar modo oscuro'}>
              <IconButton onClick={toggleColorMode} color="inherit" aria-label="Cambiar modo de color">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            {user && <NotificationCenter />}

            {!user && (
              <>
                <Button component={RouterLink} to="/jobs" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3, color: 'text.primary' }}>
                  Empleos
                </Button>
                <Button component={RouterLink} to="/login" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3, color: 'text.primary' }}>
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
            )}

            {user && (
              <IconButton onClick={handleLogout} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
                <LogoutIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {user && (
        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
            }}
          >
            {drawerContent}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: user ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' } }}>
        <Toolbar sx={{ minHeight: 68 }} />
        <Container maxWidth="xl" sx={{ py: isJobsPage ? 0 : 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
