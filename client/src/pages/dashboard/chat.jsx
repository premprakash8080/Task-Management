import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faPaperPlane, faTrash, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { messageService } from '../../components/api';

const Chat = () => {
    const [recentChats, setRecentChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef(null);

    // Fetch recent chats and unread count
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [chatsResponse, unreadResponse] = await Promise.all([
                    messageService.getRecentChats(),
                    messageService.getUnreadCount()
                ]);
                setRecentChats(chatsResponse);
                setUnreadCount(unreadResponse.count);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            markMessagesAsRead();
        }
    }, [selectedChat, page]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await messageService.getChatMessages(selectedChat.user._id, page);
            setMessages(prev => page === 1 ? response.messages : [...prev, ...response.messages]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await messageService.markMessagesAsRead(selectedChat.user._id);
            setUnreadCount(prev => Math.max(0, prev - selectedChat.unreadCount));
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                recipient: selectedChat.user._id,
                content: newMessage.trim()
            };
            const response = await messageService.sendMessage(messageData);
            setMessages(prev => [...prev, response]);
            setNewMessage('');
            // Update recent chats to show latest message
            updateRecentChats(response);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await messageService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (err) {
            setError(err.message);
        }
    };

    const updateRecentChats = (newMessage) => {
        setRecentChats(prev => {
            const updated = [...prev];
            const chatIndex = updated.findIndex(chat => 
                chat.user._id === selectedChat.user._id
            );
            if (chatIndex !== -1) {
                updated[chatIndex] = {
                    ...updated[chatIndex],
                    lastMessage: {
                        content: newMessage.content,
                        createdAt: newMessage.createdAt
                    }
                };
            }
            return updated;
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Team Chat</h1>
                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                            {unreadCount}
                        </span>
                    )}
                    <button className="btn btn-primary">
                        <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
                        New Group
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-12 gap-6 bg-white rounded-lg shadow-sm">
                {/* Recent Chats Sidebar */}
                <div className="col-span-3 border-r border-gray-200 p-4">
                    <h2 className="text-lg font-semibold mb-4">Recent Chats</h2>
                    {loading && !recentChats.length ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentChats.map(chat => (
                                <div
                                    key={chat.user._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                                        selectedChat?.user._id === chat.user._id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="font-medium">{chat.user.name}</div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {chat.lastMessage.content}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {formatDate(chat.lastMessage.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="col-span-9 p-4">
                    {selectedChat ? (
                        <>
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold">{selectedChat.user.name}</h3>
                            </div>

                            {/* Messages */}
                            <div className="h-[calc(100vh-350px)] overflow-y-auto mb-4">
                                {messages.map(message => (
                                    <div
                                        key={message._id}
                                        className={`flex mb-4 ${
                                            message.sender === selectedChat.user._id ? 'justify-start' : 'justify-end'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${
                                                message.sender === selectedChat.user._id
                                                    ? 'bg-gray-100'
                                                    : 'bg-blue-500 text-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <p>{message.content}</p>
                                                <button
                                                    onClick={() => handleDeleteMessage(message._id)}
                                                    className="text-xs opacity-50 hover:opacity-100"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                            <div className={`text-xs mt-1 ${
                                                message.sender === selectedChat.user._id
                                                    ? 'text-gray-500'
                                                    : 'text-blue-100'
                                            }`}>
                                                {formatDate(message.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <button
                                    type="button"
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={faPaperclip} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    disabled={!newMessage.trim()}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Chat; 