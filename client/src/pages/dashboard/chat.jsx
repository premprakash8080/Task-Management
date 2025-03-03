import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserGroup, 
    faPaperPlane, 
    faTrash, 
    faPaperclip,
    faUsers,
    faPlus,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { messageService, projectService } from '../../components/api';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [recentChats, setRecentChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [projects, setProjects] = useState([]);
    const messagesEndRef = useRef(null);
    const [showTeamInfo, setShowTeamInfo] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);

    const fetchUnreadCount = async () => {
        try {
            const response = await messageService.getUnreadCount();
            setUnreadCount(response.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const projectId = searchParams.get('projectId');
        const projectTitle = searchParams.get('projectTitle');
        
        if (projectId && projectTitle) {
            setSelectedChat({
                user: {
                    _id: projectId,
                    title: decodeURIComponent(projectTitle)
                },
                isProjectChat: true
            });
        }
        
        fetchInitialData();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [location]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            markMessagesAsRead();
        }
    }, [selectedChat, page]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            markMessagesAsRead();

            const interval = setInterval(() => {
                fetchMessages();
                fetchUnreadCount();
            }, 3000);

            setPollingInterval(interval);

            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
        }
    }, [selectedChat]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [chatsResponse, unreadResponse, projectsResponse] = await Promise.all([
                messageService.getRecentChats(),
                messageService.getUnreadCount(),
                projectService.getAllProjects()
            ]);
            
            const projectsData = projectsResponse.map(project => ({
                _id: project._id,
                title: project.title,
                members: project.members,
                isProjectChat: true
            }));
            
            const existingProjectIds = new Set(
                chatsResponse
                    .filter(chat => chat.isProjectChat)
                    .map(chat => chat.user._id)
            );

            const additionalProjects = projectsData.filter(
                project => !existingProjectIds.has(project._id)
            );

            setRecentChats([...chatsResponse, ...additionalProjects]);
            setUnreadCount(unreadResponse.count);
            setProjects(projectsData);

            const searchParams = new URLSearchParams(location.search);
            const projectId = searchParams.get('projectId');
            if (projectId) {
                const project = projectsData.find(p => p._id === projectId);
                if (project) {
                    setSelectedChat({
                        user: project,
                        isProjectChat: true
                    });
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await messageService.getChatMessages(
                selectedChat.isProjectChat ? null : selectedChat.user._id,
                selectedChat.isProjectChat ? selectedChat.user._id : null,
                page
            );
            setMessages(prev => page === 1 ? response.messages : [...prev, ...response.messages]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await messageService.markMessagesAsRead(
                selectedChat.isProjectChat ? null : selectedChat.user._id,
                selectedChat.isProjectChat ? selectedChat.user._id : null
            );
            await fetchUnreadCount();
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messageData = selectedChat.isProjectChat
                ? {
                    content: newMessage.trim(),
                    projectId: selectedChat.user._id,
                    isGroupMessage: true
                }
                : {
                    content: newMessage.trim(),
                    recipient: selectedChat.user._id
                };

            const response = await messageService.sendMessage(messageData);
            setMessages(prev => [...prev, response]);
            setNewMessage('');
            updateRecentChats(response);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleProjectChatSelect = async (projectId, projectTitle) => {
        setSelectedChat({
            user: {
                _id: projectId,
                title: projectTitle
            },
            isProjectChat: true
        });
        setPage(1);
        setShowNewChatModal(false);
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
                (chat.isProjectChat ? chat.user._id === selectedChat.user._id : chat.user._id === selectedChat.user._id)
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

    const TeamInfoModal = () => {
        if (!showTeamInfo || !selectedChat?.user) return null;

        const members = selectedChat.user.members || [];
        const onlineMembers = members.filter(member => member.isOnline);

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Team Chat Info</h3>
                        <button 
                            onClick={() => setShowTeamInfo(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            ×
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700">Project</h4>
                            <p className="text-gray-600">{selectedChat.user.title}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700">
                                Team Members ({members.length})
                            </h4>
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                {members.map(member => (
                                    <div key={member.user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                            <FontAwesomeIcon 
                                                icon={faUser} 
                                                className={`text-${member.isOnline ? 'green' : 'gray'}-400`} 
                                            />
                                            <div>
                                                <span className="text-gray-800">
                                                    {member.user.name}
                                                </span>
                                                <span className="text-gray-400 text-sm ml-2">
                                                    ({member.role})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ChatHeader = () => (
        <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
                <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => selectedChat?.isProjectChat && setShowTeamInfo(true)}
                >
                    <FontAwesomeIcon 
                        icon={selectedChat?.isProjectChat ? faUsers : faUserGroup} 
                        className="mr-2 text-gray-500"
                    />
                    <div>
                        <h3 className="text-lg font-semibold">
                            {selectedChat?.user.title || selectedChat?.user.name}
                        </h3>
                        {selectedChat?.isProjectChat && (
                            <p className="text-sm text-gray-500">
                                {selectedChat.user.members?.length || 0} team members
                            </p>
                        )}
                    </div>
                </div>
                {selectedChat?.isProjectChat && (
                    <button
                        onClick={() => setShowTeamInfo(true)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        View Team
                    </button>
                )}
            </div>
        </div>
    );

    const MessageList = () => (
        <div className="h-[calc(100vh-350px)] overflow-y-auto mb-4">
            {messages.map(message => (
                <div
                    key={message._id}
                    className={`flex mb-4 ${
                        message.sender._id === JSON.parse(localStorage.getItem('user')?._id || '{}')
                            ? 'justify-end'
                            : 'justify-start'
                    }`}
                >
                    <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender._id === JSON.parse(localStorage.getItem('user')?._id || '{}')
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100'
                        }`}
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                {selectedChat?.isProjectChat && (
                                    <div className="text-xs opacity-75 mb-1 font-medium">
                                        {message.sender.name}
                                    </div>
                                )}
                                <p>{message.content}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-xs opacity-50 hover:opacity-100"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                        <div className={`text-xs mt-1 ${
                            message.sender._id === JSON.parse(localStorage.getItem('user')?._id || '{}')
                                ? 'text-blue-100'
                                : 'text-gray-500'
                        }`}>
                            {formatDate(message.createdAt)}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );

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
                    <button 
                        onClick={() => setShowNewChatModal(true)}
                        className="btn btn-primary"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        New Chat
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
                                    <div className="flex items-center">
                                        <FontAwesomeIcon 
                                            icon={chat.isProjectChat ? faUsers : faUserGroup} 
                                            className="mr-2 text-gray-500"
                                        />
                                        <div className="font-medium">
                                            {chat.user.title || chat.user.name}
                                            {chat.isProjectChat && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                    (Team Chat)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 truncate mt-1">
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
                            <ChatHeader />
                            <MessageList />
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

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Start New Chat</h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Project Team Chats</h4>
                            <div className="space-y-2">
                                {projects.map(project => (
                                    <div
                                        key={project._id}
                                        onClick={() => {
                                            handleProjectChatSelect(project._id, project.title);
                                        }}
                                        className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-gray-500" />
                                        <div>
                                            <div className="font-medium">{project.title}</div>
                                            <div className="text-sm text-gray-500">
                                                {project.members?.length || 0} members
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
            <TeamInfoModal />
        </div>
    );
};

export default Chat; 