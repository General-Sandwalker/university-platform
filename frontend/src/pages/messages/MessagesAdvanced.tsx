import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare, Send, Inbox, Mail, Search, X, Paperclip, 
  MoreVertical, Star, Trash2, Check, CheckCheck,
  RefreshCw
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

const MessagesAdvanced = () => {
  return (
    <Routes>
      <Route path="/" element={<MessageList />} />
      <Route path="/conversation/:userId" element={<Conversation />} />
      <Route path="/new" element={<NewMessage />} />
    </Routes>
  );
};

const MessageList = () => {
  const [tab, setTab] = useState<'inbox' | 'sent' | 'starred' | 'archived'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data: allConversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
    refetchInterval: 30000, // Refetch every 30 seconds for "real-time" feel
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: messageService.getUnreadCount,
    refetchInterval: 30000,
  });

  // Filter conversations based on active tab
  const conversations = allConversations
    .map((conv: any) => ({
      ...conv,
      otherUser: conv.user || conv.otherUser, // Normalize the field name
    }))
    .filter((conv: any) => {
      if (tab === 'inbox') {
        // Show conversations where last message was received (not sent by current user)
        return conv.lastMessage?.sender?.id !== currentUser?.id;
      } else if (tab === 'sent') {
        // Show conversations where last message was sent by current user
        return conv.lastMessage?.sender?.id === currentUser?.id;
      } else if (tab === 'starred') {
        // Show conversations where last message is starred by current user
        const lastMsg = conv.lastMessage;
        if (!lastMsg) return false;
        
        // Check if starred by sender (if current user is sender) or receiver (if current user is receiver)
        if (lastMsg.sender?.id === currentUser?.id) {
          return lastMsg.isStarredBySender === true;
        } else {
          return lastMsg.isStarredByReceiver === true;
        }
      }
      return true;
    });

  const markAsReadMutation = useMutation({
    mutationFn: (userIds: string[]) => 
      Promise.all(userIds.map(id => messageService.markConversationAsRead(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      toast.success('Marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageIds: string[]) => 
      Promise.all(messageIds.map(id => messageService.deleteMessage(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Messages deleted');
      setSelectedMessages(new Set());
    },
  });

  const starMutation = useMutation({
    mutationFn: (messageId: string) => messageService.toggleStar(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message starred');
    },
  });

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      conv.otherUser?.firstName?.toLowerCase().includes(search) ||
      conv.otherUser?.lastName?.toLowerCase().includes(search) ||
      conv.lastMessage?.content?.toLowerCase().includes(search)
    );
  });

  const toggleSelection = (userId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedMessages(newSelection);
  };

  const handleBulkAction = (action: 'read' | 'delete') => {
    if (selectedMessages.size === 0) return;
    
    const userIds = Array.from(selectedMessages);
    if (action === 'read') {
      markAsReadMutation.mutate(userIds);
    } else if (action === 'delete') {
      if (window.confirm(`Delete ${selectedMessages.size} conversations?`)) {
        deleteMutation.mutate(userIds);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-600">Communicate with students and staff</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/messages/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="input pl-10"
            />
          </div>
          
          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedMessages.size} selected</span>
              <button
                onClick={() => handleBulkAction('read')}
                className="btn-secondary text-sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="btn-secondary text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTab('inbox')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                tab === 'inbox'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Inbox
              {unreadCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                tab === 'sent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4" />
              Sent
            </button>
            <button
              onClick={() => setTab('starred')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                tab === 'starred'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Star className="w-4 h-4" />
              Starred
            </button>
          </nav>
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv: any) => (
              <div
                key={conv.otherUser?.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
                  conv.unreadCount > 0 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedMessages.has(conv.otherUser?.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(conv.otherUser?.id);
                    }}
                    className="mt-1"
                  />
                  
                  {/* Avatar */}
                  <div 
                    onClick={() => navigate(`/messages/conversation/${conv.otherUser?.id}`)}
                    className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  >
                    {conv.otherUser?.firstName?.[0]}{conv.otherUser?.lastName?.[0]}
                  </div>
                  
                  {/* Content */}
                  <div 
                    onClick={() => navigate(`/messages/conversation/${conv.otherUser?.id}`)}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${
                        conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {conv.otherUser?.role}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conv.lastMessage?.createdAt), { addSuffix: true })}
                        </p>
                        {conv.lastMessage?.readAt && (
                          <CheckCheck className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 truncate ${
                      conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conv.lastMessage?.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                        {conv.unreadCount} new
                      </span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (conv.lastMessage?.id) {
                          starMutation.mutate(conv.lastMessage.id);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          conv.lastMessage?.isStarredBySender || conv.lastMessage?.isStarredByReceiver
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Conversation = () => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();

  // Prevent sending messages to yourself
  useEffect(() => {
    if (userId === currentUser?.id) {
      toast.error('Cannot view conversation with yourself');
      navigate('/messages');
    }
  }, [userId, currentUser?.id, navigate]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['conversation', userId],
    queryFn: () => messageService.getConversation(userId!),
    enabled: !!userId && userId !== currentUser?.id,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const { data: otherUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId && userId !== currentUser?.id,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.sendMessage({ 
      receiverId: userId!, 
      content 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
      setAttachments([]);
      toast.success('Message sent!');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => messageService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    },
  });

  const markConversationAsReadMutation = useMutation({
    mutationFn: () => messageService.markConversationAsRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      toast.success('Marked as read');
      setShowMenu(false);
    },
  });

  const starMutation = useMutation({
    mutationFn: (messageId: string) => messageService.toggleStar(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message starred');
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: () => Promise.all(messages.map((msg: any) => messageService.deleteMessage(msg.id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation deleted');
      navigate('/messages');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark unread messages as read
    messages.forEach((msg: any) => {
      if (!msg.readAt && msg.receiverId === currentUser?.id) {
        markAsReadMutation.mutate(msg.id);
      }
    });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      sendMutation.mutate(message);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="text-primary-600 hover:text-primary-700"
            >
              ← Back
            </button>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {otherUser?.firstName} {otherUser?.lastName}
              </div>
              <div className="text-sm text-gray-500">{otherUser?.role} • {otherUser?.cin}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Star last message button */}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage?.id) {
                    starMutation.mutate(lastMessage.id);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Star conversation"
              >
                <Star 
                  className={`w-5 h-5 ${
                    messages.some((msg: any) => msg.isStarredBySender || msg.isStarredByReceiver)
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>
            )}
            
            {/* Menu dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => markConversationAsReadMutation.mutate()}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark all as read
                    </button>
                    <button
                      onClick={() => {
                        const lastMessage = messages[messages.length - 1];
                        if (lastMessage?.id) {
                          starMutation.mutate(lastMessage.id);
                          setShowMenu(false);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {messages.some((msg: any) => msg.isStarredBySender || msg.isStarredByReceiver) 
                        ? 'Unstar conversation' 
                        : 'Star conversation'}
                    </button>
                    <button
                      onClick={() => navigate(`/users/${userId}`)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View profile
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this entire conversation?')) {
                          deleteConversationMutation.mutate();
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete conversation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="card">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isSent = msg.senderId !== userId;
              const isStarred = msg.isStarredBySender || msg.isStarredByReceiver;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className="flex items-start gap-2">
                    {!isSent && (
                      <button
                        onClick={() => starMutation.mutate(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            isStarred 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isSent
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center gap-2 mt-1 text-xs ${
                        isSent ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        <span>{format(new Date(msg.createdAt), 'p')}</span>
                        {isSent && (
                          msg.readAt ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )
                        )}
                        {isStarred && <Star className="w-3 h-3 fill-current" />}
                      </div>
                    </div>
                    {isSent && (
                      <button
                        onClick={() => starMutation.mutate(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            isStarred 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Send Form */}
        <form onSubmit={handleSend} className="px-4 pb-4 flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!message.trim() && attachments.length === 0}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

const NewMessage = () => {
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/users', { 
        params: { search: searchQuery, limit: 20 } 
      });
      return response.data.data?.users || response.data.users || response.data || [];
    },
    enabled: searchQuery.length > 2,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string }) => 
      messageService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message sent!');
      navigate('/messages');
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) {
      toast.error('Please select a recipient');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }
    sendMutation.mutate({ receiverId, content });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
          <button
            onClick={() => navigate('/messages')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, CIN, or email..."
                className="input pl-10"
              />
            </div>
            
            {users.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {users.map((user: any) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setReceiverId(user.id);
                      setSearchQuery(`${user.firstName} ${user.lastName}`);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
                      receiverId === user.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.cin} • {user.role} • {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="input"
              placeholder="Type your message..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!receiverId || !content.trim()}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagesAdvanced;
