import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Shield, Clock, MessageSquare, X, Paperclip, File, Image as ImageIcon, Download, Loader2 } from 'lucide-react';

const JournalChat = ({ articleId, senderRole, senderName, senderEmail, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${articleId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s for new messages
    return () => clearInterval(interval);
  }, [articleId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        content: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    setSending(true);
    const messageData = {
      articleId: Number(articleId),
      senderRole,
      senderName,
      senderEmail,
      content: newMessage,
      fileContent: attachment?.content,
      fileName: attachment?.name,
      fileType: attachment?.type
    };

    try {
      console.log('Sending message:', messageData);
      const response = await axios.post('/api/messages', messageData);
      console.log('Message sent successfully:', response.data);
      setMessages([...messages, response.data]);
      setNewMessage('');
      setAttachment(null);
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const downloadFile = (content, name, type) => {
    const link = document.createElement('a');
    link.href = content;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-500 p-2 rounded-xl">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">Manuscript Discussion</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Direct line for improvements</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Start the conversation to discuss manuscript details.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_role === senderRole;
            const isImage = msg.file_type?.startsWith('image/');
            
            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`flex items-center space-x-2 mb-1 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {msg.sender_name}
                    </span>
                    {msg.sender_email && !msg.sender_email.includes('@phone.auth') && (
                      <span className="text-[9px] font-bold text-slate-300 lowercase">{msg.sender_email}</span>
                    )}
                    {msg.sender_email && msg.sender_email.includes('@phone.auth') && (
                      <span className="text-[9px] font-bold text-slate-300">{msg.sender_email.split('@')[0]}</span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                      msg.sender_role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {msg.sender_role}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm border ${
                    isMe 
                      ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                      : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content && <p className="mb-2">{msg.content}</p>}
                    
                    {msg.file_content && (
                      <div className={`mt-2 ${isMe ? 'bg-slate-800' : 'bg-slate-50'} p-3 rounded-xl border border-white/10`}>
                        {isImage ? (
                          <div className="space-y-2">
                            <img 
                              src={msg.file_content} 
                              alt={msg.file_name} 
                              className="max-w-full rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.file_content, '_blank')}
                            />
                            <p className={`text-[10px] font-bold ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>{msg.file_name}</p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => downloadFile(msg.file_content, msg.file_name, msg.file_type)}
                            className={`flex items-center space-x-3 w-full text-left group`}
                          >
                            <div className={`p-2 rounded-lg ${isMe ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                              <File className={`h-4 w-4 ${isMe ? 'text-primary-400' : 'text-primary-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>{msg.file_name}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-tight ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                                Click to download
                              </p>
                            </div>
                            <Download className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-slate-400' : 'text-slate-300'}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-slate-400 mt-1 font-bold">
                    {msg.created_at ? (
                      <>
                        {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : 'Just now'}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
        {attachment && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                {attachment.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-primary-600" /> : <File className="h-4 w-4 text-primary-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{attachment.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready to send</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setAttachment(null)}
              className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
        
        <div className="relative flex items-center gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl px-6 py-4 text-sm font-medium placeholder:text-slate-400 transition-all"
            />
            <button 
              type="submit"
              disabled={sending || (!newMessage.trim() && !attachment)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournalChat;
