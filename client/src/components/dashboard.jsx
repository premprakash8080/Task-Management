import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation } from 'react-router-dom';
import Story from './story';
import AddStory from './forms/addStory';
import Loader from './loader';
import Header from './common/header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Dashboard = ({ params }) => {
    const [state, setState] = useState({
        open: false,
        show: true,
        tasks: [],
        stories: [],
        err: '',
        err2: '',
        loading: true,
        loadingStory: true
    });

    const location = useLocation();

    useEffect(() => {
        getStoryDetails();
        getData();
        const dataInterval = setInterval(getData, 2000);
        
        return () => clearInterval(dataInterval);
    }, [params.id]);

    const getStoryDetails = () => {
        axios.get('http://localhost:9000/story')
            .then((r) => {
                if (r.data.success) {
                    setState(prev => ({
                        ...prev,
                        stories: r.data.data,
                        err2: ''
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        err2: r.data.message
                    }));
                }
            })
            .then(() => {
                setState(prev => ({
                    ...prev,
                    loadingStory: false
                }));
            })
            .catch((e) => {
                setState(prev => ({
                    ...prev,
                    loadingStory: false,
                    err2: e.message
                }));
            });
    };

    const getData = () => {
        const { id } = params;
        if (id) {
            axios.get(`http://localhost:9000/tasks/${id}`)
                .then((r) => {
                    console.log("Fetched tasks for story:", r.data);
                    setState(prev => ({
                        ...prev,
                        tasks: r.data,
                        err: ''
                    }));
                })
                .catch((e) => {
                    if (!e.response) {
                        setState(prev => ({
                            ...prev,
                            loading: true,
                            err: e
                        }));
                    } else {
                        setState(prev => ({
                            ...prev,
                            loading: false,
                            err: e
                        }));
                    }
                });
        } else {
            console.error("ID is undefined");
        }
    };

    const addStory = async (story) => {
        try {
            const response = await axios.post('/api/stories', story);
            setState(prev => ({
                ...prev,
                stories: [...prev.stories, response.data]
            }));
        } catch (error) {
            console.error('Error adding story:', error);
        }
    };

    let storyTable;
    if (!state.loadingStory) {
        storyTable = state.stories.map((story, index) => (
            <li key={index}>
                <Link to={`/story/${story.storyId}`} className="active">
                    <i className="fas fa-list-alt"></i>
                    <span className="menu-text">{story.title}</span>
                </Link>
            </li>
        ));
    } else {
        storyTable = (
            <li>
                <div className="loader">
                    <Loader />
                </div>
            </li>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="side">
                <div className="logo">
                    Task Manager
                </div>
                
                <ul className="side-menu">
                    <li>
                        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                            <FontAwesomeIcon icon={faHome} />
                            <span className="menu-text">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                            <FontAwesomeIcon icon={faList} />
                            <span className="menu-text">Users</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/stories" className={location.pathname.includes('/stories') ? 'active' : ''}>
                            <FontAwesomeIcon icon={faList} />
                            <span className="menu-text">Stories</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
                            <FontAwesomeIcon icon={faCog} />
                            <span className="menu-text">Settings</span>
                        </Link>
                    </li>
                </ul>

                <div className="otherMenu">
                    <button className="btnDashboard btn btn-primary btn-sm">
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <main className="con">
                <Header />
                <aside>
                    {state.stories.length > 0 ? (
                        <Story
                            storyName={state.stories.filter(i => i.storyId === parseInt(params.id))}
                            storyType={params.id}
                            tasks={state.tasks}
                            loading={state.loading}
                            storyId={params.id}
                        />
                    ) : (
                        <div>No stories available.</div>
                    )}
                </aside>
            </main>
        </div>
    );
};

const DashboardWrapper = (props) => {
    const params = useParams();
    return <Dashboard {...props} params={params} />;
};

export default DashboardWrapper;