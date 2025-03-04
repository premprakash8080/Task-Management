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
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const messagesContainerRef = useRef(null);
    const previousMessagesLength = useRef(0);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const lastMessageRef = useRef(null);
    const lastPolledMessagesCount = useRef(0);

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
                checkNewMessages();
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

    const fetchMessages = async (isPolling = false) => {
        try {
            setLoading(true);
            const response = await messageService.getChatMessages(
                selectedChat.isProjectChat ? null : selectedChat.user._id,
                selectedChat.isProjectChat ? selectedChat.user._id : null,
                page
            );

            setMessages(prev => {
                const newMessages = page === 1 ? response.messages : [...prev, ...response.messages];
                
                if (isPolling && newMessages.length > previousMessagesLength.current) {
                    setTimeout(scrollToBottom, 100);
                }
                
                previousMessagesLength.current = newMessages.length;
                return newMessages;
            });

            if (isInitialLoad) {
                setTimeout(scrollToBottom, 100);
                setIsInitialLoad(false);
            }
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
        if (!selectedChat?.user?._id || !newMessage) return;

        setRecentChats(prev => {
            const updated = [...prev];
            const chatIndex = updated.findIndex(chat => {
                if (!chat?.user?._id) return false;
                return chat.isProjectChat 
                    ? chat.user._id === selectedChat.user._id 
                    : chat.user._id === selectedChat.user._id;
            });

            if (chatIndex !== -1) {
                updated[chatIndex] = {
                    ...updated[chatIndex],
                    lastMessage: {
                        content: newMessage.content || '',
                        createdAt: newMessage.createdAt || new Date()
                    }
                };
                return updated;
            }

            // If chat not found, add it to the beginning of the list
            const newChat = {
                user: selectedChat.user,
                isProjectChat: selectedChat.isProjectChat,
                lastMessage: {
                    content: newMessage.content || '',
                    createdAt: newMessage.createdAt || new Date()
                }
            };
            return [newChat, ...prev];
        });
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            setHasNewMessages(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const checkNewMessages = async () => {
        try {
            const response = await messageService.getChatMessages(
                selectedChat.isProjectChat ? null : selectedChat.user._id,
                selectedChat.isProjectChat ? selectedChat.user._id : null,
                1
            );

            const newMessages = response.messages;
            if (newMessages.length > lastPolledMessagesCount.current) {
                const diff = newMessages.length - lastPolledMessagesCount.current;
                const actualNewMessages = newMessages.slice(-diff);
                
                setMessages(prev => [...prev, ...actualNewMessages]);
                lastPolledMessagesCount.current = newMessages.length;
                
                // Only scroll if user is near bottom
                const container = messagesContainerRef.current;
                if (container) {
                    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                    if (isNearBottom) {
                        setTimeout(scrollToBottom, 100);
                    } else {
                        setHasNewMessages(true);
                    }
                }
            }
            
            fetchUnreadCount();
        } catch (err) {
            console.error('Error checking new messages:', err);
        }
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

    const MessageList = () => {
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;

        const isCurrentUser = (senderId) => {
            return senderId === currentUserId;
        };

        return (
            <div className="relative h-[calc(100vh-350px)]">
                <div 
                    ref={messagesContainerRef}
                    className="h-full overflow-y-auto mb-4 scroll-smooth"
                >
                    {loading && isInitialLoad ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="space-y-4 px-2">
                            {messages.map((message, index) => {
                                if (!message || !message.sender) return null;

                                const isLast = index === messages.length - 1;
                                return (
                                    <div
                                        key={message._id}
                                        ref={isLast ? lastMessageRef : null}
                                        className={`flex mb-4 ${
                                            isCurrentUser(message.sender._id)
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${
                                                isCurrentUser(message.sender._id)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    {selectedChat?.isProjectChat && message.sender.name && (
                                                        <div className="text-xs opacity-75 mb-1 font-medium">
                                                            {message.sender.name}
                                                        </div>
                                                    )}
                                                    <p>{message.content || 'No message content'}</p>
                                                </div>
                                                {isCurrentUser(message.sender._id) && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(message._id)}
                                                        className="text-xs opacity-50 hover:opacity-100"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`text-xs mt-1 ${
                                                isCurrentUser(message.sender._id)
                                                    ? 'text-blue-100'
                                                    : 'text-gray-500'
                                            }`}>
                                                {formatDate(message.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {hasNewMessages && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                        New Messages ↓
                    </button>
                )}
            </div>
        );
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
                            {recentChats.filter(chat => chat?.user?._id).map(chat => (
                                <div
                                    key={chat.user._id}
                                    onClick={() => setSelectedChat({
                                        ...chat,
                                        user: {
                                            ...chat.user,
                                            _id: chat.user._id,
                                            title: chat.user.title || chat.user.name || 'Unnamed Chat',
                                            members: chat.user.members || []
                                        },
                                        isProjectChat: !!chat.isProjectChat
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                                        selectedChat?.user?._id === chat.user?._id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FontAwesomeIcon 
                                            icon={chat.isProjectChat ? faUsers : faUserGroup} 
                                            className="mr-2 text-gray-500"
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {chat.user.title || chat.user.name || 'Unnamed Chat'}
                                                {chat.isProjectChat && (
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        (Team Chat)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate mt-1">
                                                {chat.lastMessage?.content || 'No messages yet'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {chat.lastMessage?.createdAt ? formatDate(chat.lastMessage.createdAt) : ''}
                                            </div>
                                        </div>
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