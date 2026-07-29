import api from './axios';

export const getConversations = async () => {
  const { data } = await api.get('/messages/conversations');
  return data.data || [];
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/messages/conversations/${id}`);
  return data.data;
};

export const startConversation = async (payload) => {
  const { data } = await api.post('/messages/conversations', payload);
  return data.data;
};

export const sendMessage = async (id, body) => {
  const { data } = await api.post(`/messages/conversations/${id}/messages`, { body });
  return data.data;
};

export const getUnreadMessagesCount = async () => {
  const { data } = await api.get('/messages/unread-count');
  return data.data?.unread || 0;
};
