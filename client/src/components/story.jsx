import React, { Component } from 'react';
import Task from './task';
import Tooltips from './tooltip';
import AddStory from './forms/addStory';
import axios from 'axios';

export default class Story extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stories: [],
            tasks: [],
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        this.fetchTasks(this.props.storyId);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.storyId !== this.props.storyId) {
            this.fetchTasks(this.props.storyId);
        }
    }

    fetchTasks = async (storyId) => {
        if (!storyId) return;
        
        try {
            this.setState({ loading: true, error: null });
            const response = await axios.get(`/api/tasks/${storyId}`);
            
            if (response.data.success) {
                this.setState({
                    tasks: response.data.data,
                    loading: false
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch tasks');
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            this.setState({ 
                loading: false, 
                error: error.message || 'Failed to fetch tasks'
            });
        }
    };

    addStory = async (newStory) => {
        try {
            const response = await axios.post('/api/story', newStory);
            if (response.data.success) {
                this.setState(prevState => ({
                    stories: [...prevState.stories, response.data.data]
                }));
                this.fetchTasks(response.data.data.storyId);
            }
        } catch (error) {
            console.error("Error adding story:", error);
        }
    };

    render() {
        const { tasks, loading, error } = this.state;
        const { storyName } = this.props;

        if (error) {
            return (
                <div className="p-4 text-red-600 bg-red-50 rounded-lg">
                    <p>Error: {error}</p>
                    <button 
                        onClick={() => this.fetchTasks(this.props.storyId)}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return (
            <div className="story-container p-4">
                <AddStory onAddStory={this.addStory} fetchTasks={this.fetchTasks} />
                <div className="story-header mb-4">
                    <h2 className="text-2xl font-bold">{storyName[0] ? storyName[0].title : "Loading..."}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="mcell mcolor1" data-status="1">
                        <div className="mcell-title">
                            <i className="fas fa-lightbulb mr-2" /> 
                            <span>Backlog</span>
                            <Tooltips id="1" content="Tasks that need to be done" placement="top" />
                        </div>
                        <Task tasks={tasks} loading={loading} filter="1" />
                    </div>
                    <div className="mcell mcolor2" data-status="2">
                        <div className="mcell-title">
                            <i className="fas fa-bars mr-2" /> 
                            <span>TODO</span>
                            <Tooltips id="2" content="Tasks planned for the current sprint" placement="top" />
                        </div>
                        <Task tasks={tasks} loading={loading} filter="2" />
                    </div>
                    <div className="mcell mcolor3" data-status="3">
                        <div className="mcell-title">
                            <i className="fas fa-spinner mr-2" /> 
                            <span>In Progress</span>
                            <Tooltips id="3" content="Tasks currently being worked on" placement="top" />
                        </div>
                        <Task tasks={tasks} loading={loading} filter="3" />
                    </div>
                    <div className="mcell mcolor4" data-status="4">
                        <div className="mcell-title">
                            <i className="fas fa-check mr-2" /> 
                            <span>Done</span>
                            <Tooltips id="4" content="Tasks completed" placement="top" />
                        </div>
                        <Task tasks={tasks} loading={loading} filter="4" />
                    </div>
                </div>
            </div>
        );
    }
}