import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Box, Button, Divider, IconButton, List, ListItemButton, Popover, Stack, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notifications';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await getNotifications();
      setItems(data?.notifications || []);
      setUnread(Number(data?.unread || 0));
    } catch { /* La navegación debe seguir funcionando si las notificaciones fallan. */ }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  const openItem = async (item) => {
    if (!item.read_at) {
      await markNotificationRead(item.id).catch(() => {});
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, read_at: new Date().toISOString() } : value));
      setUnread((current) => Math.max(0, current - 1));
    }
    setAnchor(null);
    if (item.action_url) navigate(item.action_url);
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <>
      <IconButton color="inherit" aria-label="Notificaciones" onClick={(event) => { setAnchor(event.currentTarget); load(); }}>
        <Badge badgeContent={unread} color="error" max={99}><NotificationsIcon /></Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 410 }, maxHeight: 520, borderRadius: 3 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
          <Box>
            <Typography variant="h6" fontWeight={900}>Notificaciones</Typography>
            <Typography variant="caption" color="text.secondary">{unread} sin leer</Typography>
          </Box>
          <Button size="small" startIcon={<DoneAllIcon />} onClick={markAll} disabled={!unread}>Marcar todas</Button>
        </Stack>
        <Divider />
        <List disablePadding>
          {items.map((item) => (
            <ListItemButton key={item.id} onClick={() => openItem(item)} sx={{ alignItems: 'flex-start', py: 1.5, bgcolor: item.read_at ? 'transparent' : 'action.hover' }}>
              <Box>
                <Typography fontWeight={item.read_at ? 700 : 900}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                <Typography variant="caption" color="text.disabled">{relativeDate(item.created_at)}</Typography>
              </Box>
            </ListItemButton>
          ))}
          {!items.length && <Box p={4} textAlign="center"><Typography color="text.secondary">No tienes notificaciones.</Typography></Box>}
        </List>
      </Popover>
    </>
  );
}

function relativeDate(value) {
  if (!value) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return new Date(value).toLocaleDateString('es-NI', { dateStyle: 'medium' });
}
