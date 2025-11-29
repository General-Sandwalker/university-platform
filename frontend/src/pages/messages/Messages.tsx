import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Send, Inbox, Mail, X } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';
import { format } from 'date-fns';
import apiClient from '../../lib/axios';

const Messages = () => {
  return (
    <Routes>
      <Route path="/" element={<MessageList />} />
      <Route path="/conversation/:userId" element={<Conversation />} />
    </Routes>
  );
};

const MessageList = () => {
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const navigate = useNavigate();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: messageService.getUnreadCount,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button onClick={() => setShowCompose(true)} className="btn-primary">
          <Send className="w-4 h-4 mr-2" />
          New Message
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTab('inbox')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'inbox'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Inbox className="w-4 h-4 inline mr-2" />
              Inbox {unreadCount ? `(${unreadCount})` : ''}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'sent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Sent
            </button>
          </nav>
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conv: any) => (
              <div
                key={conv.otherUser.id}
                onClick={() => navigate(`/messages/conversation/${conv.otherUser.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {conv.otherUser.firstName?.[0]}
                    {conv.otherUser.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(conv.lastMessage.createdAt), 'PPp')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                        {conv.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No conversations yet</div>
          )}
        </div>
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </div>
  );
};

const Conversation = () => {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const { data: messages } = useQuery({
    queryKey: ['conversation', userId],
    queryFn: () => messageService.getConversation(userId!),
    enabled: !!userId,
    retry: false,
  });

  const { data: otherUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data?.data || response.data;
    },
    enabled: !!userId,
    retry: false,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.sendMessage({ receiverId: userId!, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      setMessage('');
      toast.success('Message sent!');
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
          <button onClick={() => navigate('/messages')} className="btn-primary mt-4">
            View Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <button onClick={() => navigate('/messages')} className="text-primary-600 hover:text-primary-700 mb-2">
            ← Back to messages
          </button>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages?.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === userId
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-primary-600 text-white'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.senderId === userId ? 'text-gray-500' : 'text-primary-100'}`}>
                  {format(new Date(msg.createdAt), 'p')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Send Form */}
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input flex-1"
          />
          <button type="submit" disabled={!message.trim()} className="btn-primary">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

const ComposeModal = ({ onClose }: { onClose: () => void }) => {
  const [receiverId, setReceiverId] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/users', { params: { search: searchQuery } });
      return response.data.data?.users || [];
    },
    enabled: searchQuery.length > 2 && !selectedUser,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string }) => {
      console.log('mutationFn called with:', data);
      return messageService.sendMessage(data);
    },
    onSuccess: () => {
      console.log('Message sent successfully');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message sent!');
      onClose();
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== COMPOSE MESSAGE DEBUG ===');
    console.log('receiverId:', receiverId);
    console.log('content:', content);
    console.log('content.trim():', content.trim());
    console.log('selectedUser:', selectedUser);
    console.log('sendMutation.isPending:', sendMutation.isPending);
    
    if (!receiverId) {
      console.log('ERROR: No receiverId');
      toast.error('Please select a recipient');
      return;
    }
    
    if (!content.trim()) {
      console.log('ERROR: No content');
      toast.error('Please enter a message');
      return;
    }
    
    console.log('Calling sendMutation.mutate() with:', { receiverId, content });
    sendMutation.mutate({ receiverId, content });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">New Message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm space-y-1">
          <strong className="text-lg">🔍 Debug Info:</strong>
          <div className="font-mono">receiverId: <span className="font-bold text-blue-600">{receiverId || '❌ EMPTY'}</span></div>
          <div className="font-mono">selectedUser: <span className="font-bold text-blue-600">{selectedUser ? `✅ ${selectedUser.firstName}` : '❌ NULL'}</span></div>
          <div className="font-mono">content: <span className="font-bold text-green-600">{content || '❌ EMPTY'}</span></div>
          <div className="font-mono">content.trim(): <span className="font-bold text-green-600">{content.trim() || '❌ EMPTY'}</span></div>
          <div className="font-mono">isPending: <span className="font-bold">{String(sendMutation.isPending)}</span></div>
          <div className="font-mono text-red-600 text-base">
            <strong>Button disabled:</strong> {String(!receiverId || !content.trim() || sendMutation.isPending)}
          </div>
          <div className="font-mono text-red-600 text-base">
            <strong>Reason:</strong> {
              !receiverId ? '❌ No receiverId' : 
              !content.trim() ? '❌ No content' : 
              sendMutation.isPending ? '⏳ Sending...' : 
              '✅ Should work!'
            }
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.cin})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setReceiverId('');
                    setSearchQuery('');
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  placeholder="Search users..."
                  className="input mb-2"
                />
                {showResults && users && users.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {users.map((user: any) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          console.log('User selected:', user);
                          setReceiverId(user.id);
                          setSelectedUser(user);
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        {user.firstName} {user.lastName} ({user.cin})
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={content}
              onChange={(e) => {
                console.log('Content changed:', e.target.value);
                setContent(e.target.value);
              }}
              rows={4}
              className="input"
              placeholder="Type your message..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => {
                console.log('TEST BUTTON CLICKED - This proves clicks work!');
                alert('Test button works! Check console.');
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              🧪 Test Click
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="button"
              onClick={(e) => {
                console.log('=== BUTTON CLICKED ===');
                console.log('Event:', e);
                console.log('receiverId:', receiverId);
                console.log('content:', content);
                console.log('disabled:', !receiverId || !content.trim() || sendMutation.isPending);
                handleSubmit(e as any);
              }}
              disabled={!receiverId || !content.trim() || sendMutation.isPending} 
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendMutation.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;
