import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

import AddCommentIcon from '@mui/icons-material/AddComment';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import useAuth from '../../auth/AuthContext';
import useSocket from '../../realtime/SocketContext';
import useMessaging from '../../realtime/MessagingContext';
import { getConversations, getConversation, startConversation, sendMessage } from '../../api/messages';
import { getPublicCompanies, searchCandidates } from '../../api/company';
import EmptyState from '../../components/common/EmptyState';

const COMPANY_ROLES = ['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'];

function timeAgo(value) {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} d`;
}

export default function MessagesPage() {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const socket = useSocket();
  const { refreshUnread } = useMessaging();
  const isCompany = COMPANY_ROLES.includes(user?.role);

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [composeTarget, setComposeTarget] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerResults, setPickerResults] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const bottomRef = useRef(null);
  const consumedStartTarget = useRef(false);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las conversaciones');
      return [];
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  const openConversation = async (id) => {
    setComposeTarget(null);
    setSelectedId(id);
    setLoadingThread(true);
    try {
      const data = await getConversation(id);
      setThread(data);
      refreshUnread();
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)));
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo abrir la conversación');
    } finally {
      setLoadingThread(false);
    }
  };

  // Permite llegar desde otra página (ej. una vacante) ya listo para escribirle a una empresa/candidato específico.
  useEffect(() => {
    if (loadingList || consumedStartTarget.current) return;
    consumedStartTarget.current = true;

    const state = location.state || {};

    if (state.startCompanyId) {
      const existing = conversations.find((c) => c.company_id === Number(state.startCompanyId));
      if (existing) {
        openConversation(existing.id);
      } else {
        setSelectedId(null);
        setComposeTarget({
          type: 'company',
          id: Number(state.startCompanyId),
          name: state.startCompanyName || 'Empresa',
          photo: state.startCompanyPhoto || '',
        });
      }
    } else if (state.startCandidateId) {
      const existing = conversations.find((c) => c.candidate_user_id === Number(state.startCandidateId));
      if (existing) {
        openConversation(existing.id);
      } else {
        setSelectedId(null);
        setComposeTarget({
          type: 'candidate',
          id: Number(state.startCandidateId),
          name: state.startCandidateName || 'Candidato',
          photo: state.startCandidatePhoto || '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingList]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = ({ conversationId, message }) => {
      if (selectedId === conversationId) {
        setThread((prev) => {
          if (!prev || prev.conversation.id !== conversationId) return prev;
          if (prev.messages.some((m) => m.id === message.id)) return prev;
          return { ...prev, messages: [...prev.messages, message] };
        });

        getConversation(conversationId)
          .then(() => {
            refreshUnread();
            loadConversations();
          })
          .catch(() => {});
      } else {
        loadConversations();
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages?.length]);

  const handleSend = async () => {
    if (!draft.trim()) return;

    try {
      setSending(true);

      if (selectedId) {
        const message = await sendMessage(selectedId, draft.trim());
        setDraft('');
        setThread((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === message.id)) return prev;
          return { ...prev, messages: [...prev.messages, message] };
        });
        loadConversations();
      } else if (composeTarget) {
        const payload = composeTarget.type === 'company'
          ? { company_id: composeTarget.id, body: draft.trim() }
          : { candidate_user_id: composeTarget.id, body: draft.trim() };

        const result = await startConversation(payload);
        setDraft('');
        setComposeTarget(null);
        await loadConversations();
        await openConversation(result.conversationId);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const openPicker = () => {
    setPickerQuery('');
    setPickerResults([]);
    setPickerOpen(true);
  };

  useEffect(() => {
    if (!pickerOpen) return undefined;
    const delay = setTimeout(async () => {
      try {
        setPickerLoading(true);
        if (isCompany) {
          const data = await searchCandidates({ q: pickerQuery });
          setPickerResults(data?.candidates || data || []);
        } else {
          const data = await getPublicCompanies({ q: pickerQuery, limit: 20 });
          setPickerResults(data || []);
        }
      } catch {
        setPickerResults([]);
      } finally {
        setPickerLoading(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [pickerQuery, pickerOpen, isCompany]);

  const handlePickTarget = (target) => {
    setPickerOpen(false);
    setSelectedId(null);
    setThread(null);
    setDraft('');
    setComposeTarget(
      isCompany
        ? { type: 'candidate', id: target.id, name: target.name, photo: target.photo_url || '' }
        : { type: 'company', id: target.id, name: target.name, photo: target.logo_url || '' }
    );
  };

  const selectedMeta = useMemo(
    () => conversations.find((c) => c.id === selectedId),
    [conversations, selectedId]
  );

  const headerName = composeTarget?.name || selectedMeta?.other_name;
  const headerPhoto = composeTarget?.photo || selectedMeta?.other_photo_url;
  const showThreadPanel = Boolean(selectedId || composeTarget);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: '34% 66%' },
        height: 'calc(100vh - 120px)',
      }}
    >
      {error && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      )}

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={900}>Mensajes</Typography>
          <IconButton color="primary" onClick={openPicker} title="Nuevo mensaje">
            <AddCommentIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {loadingList ? (
            <Stack alignItems="center" py={4}><CircularProgress size={24} /></Stack>
          ) : conversations.length === 0 && !composeTarget ? (
            <EmptyState title="Sin conversaciones" text="Inicia un mensaje nuevo para comenzar a hablar." />
          ) : (
            <List disablePadding>
              {conversations.map((conv) => (
                <ListItemButton
                  key={conv.id}
                  selected={conv.id === selectedId}
                  onClick={() => openConversation(conv.id)}
                  sx={{
                    px: 2, py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                  }}
                >
                  <ListItemAvatar>
                    <Badge color="error" badgeContent={conv.unread_count} invisible={!conv.unread_count}>
                      <Avatar src={conv.other_photo_url || ''} variant={isCompany ? 'circular' : 'rounded'}>
                        {isCompany ? <PersonIcon /> : <BusinessIcon />}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={conv.unread_count ? 900 : 700} noWrap>{conv.other_name}</Typography>}
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conv.last_message || 'Sin mensajes'}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                    {timeAgo(conv.last_message_at)}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!showThreadPanel ? (
          <Stack alignItems="center" justifyContent="center" flex={1} spacing={1} color="text.secondary">
            <ChatBubbleOutlineIcon sx={{ fontSize: 48 }} />
            <Typography>Selecciona una conversación para ver los mensajes</Typography>
          </Stack>
        ) : loadingThread ? (
          <Stack alignItems="center" justifyContent="center" flex={1}><CircularProgress /></Stack>
        ) : (
          <>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
              <Avatar src={headerPhoto || ''} variant={isCompany ? 'circular' : 'rounded'}>
                {isCompany ? <PersonIcon /> : <BusinessIcon />}
              </Avatar>
              <Typography variant="h6" fontWeight={900}>{headerName}</Typography>
            </Stack>

            <Divider />

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {composeTarget && (
                <Stack alignItems="center" justifyContent="center" flex={1} color="text.secondary">
                  <Typography>Escribe tu primer mensaje para {composeTarget.name}</Typography>
                </Stack>
              )}

              {(thread?.messages || []).map((message) => {
                const isMine = message.sender_user_id === user?.id;
                return (
                  <Box
                    key={message.id}
                    sx={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      bgcolor: isMine ? 'primary.main' : alpha(theme.palette.text.primary, 0.06),
                      color: isMine ? 'primary.contrastText' : 'text.primary',
                      px: 2, py: 1.2,
                      borderRadius: 3,
                      borderBottomRightRadius: isMine ? 4 : 3,
                      borderBottomLeftRadius: isMine ? 3 : 4,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.body}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mt: 0.5 }}>
                      {new Date(message.created_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={bottomRef} />
            </Box>

            <Divider />

            <Stack direction="row" spacing={1} sx={{ p: 2 }}>
              <TextField
                fullWidth
                autoFocus={Boolean(composeTarget)}
                size="small"
                placeholder="Escribe un mensaje..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                multiline
                maxRows={4}
              />
              <IconButton color="primary" onClick={handleSend} disabled={sending || !draft.trim()}>
                <SendIcon />
              </IconButton>
            </Stack>
          </>
        )}
      </Box>

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>
          {isCompany ? 'Escribir a un candidato' : 'Escribir a una empresa'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            placeholder={isCompany ? 'Buscar candidato por nombre...' : 'Buscar empresa por nombre...'}
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2, mt: 1 }}
          />

          {pickerLoading ? (
            <Stack alignItems="center" py={3}><CircularProgress size={24} /></Stack>
          ) : (
            <List disablePadding>
              {pickerResults.map((item) => (
                <ListItemButton key={item.id} onClick={() => handlePickTarget(item)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <ListItemAvatar>
                    <Avatar src={item.logo_url || item.photo_url || ''} variant={isCompany ? 'circular' : 'rounded'}>
                      {isCompany ? <PersonIcon /> : <BusinessIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={isCompany ? item.headline : item.location}
                  />
                </ListItemButton>
              ))}

              {!pickerResults.length && (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  {pickerQuery ? 'Sin resultados' : 'Escribe para buscar'}
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
