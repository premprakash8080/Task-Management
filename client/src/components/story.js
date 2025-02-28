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
            loading: true
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

    fetchTasks = (storyId) => {
        if (!storyId) return; // Ensure storyId is defined
        axios.get(`http://localhost:9000/tasks/${storyId}`)
            .then((response) => {
                // Assuming response.data is now structured with statusCode, data, message, and success
                if (response.data.success) {
                    this.setState({
                        tasks: response.data.data, // Set tasks to the data array from the response
                    });
                } else {
                    console.error("Error fetching tasks:", response.data.message);
                }
                this.setState({ loading: false }); // Set loading to false after processing
            })
            .catch((error) => {
                console.error("Error fetching tasks:", error);
                this.setState({ loading: false }); // Set loading to false on error
            });
    };

    addStory = (newStory) => {
        this.setState(prevState => ({
            stories: [...prevState.stories, newStory]
        }));
        this.fetchTasks(newStory.storyId);
    };

    render() {
        const { tasks, loading } = this.state;
        return (
            <div className="container">
                {/* Pass fetchTasks to AddStory */}
                <AddStory onAddStory={this.addStory} fetchTasks={this.fetchTasks} />
                <div className="space">
                    <h2 className="story">{this.props.storyName[0] ? this.props.storyName[0].title : "Loading..."}</h2>
                </div>
                <div className="row">
                    <div className="col-sm mcell mcolor1">
                        <div className="mcell-title story">
                            <b className="fas fa-lightbulb" /> Backlog
                            <Tooltips id="1" content="You can do what you want to do with this column" placement="top" storyType={this.props.storyType} />
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Task tasks={tasks} loading={loading} filter="1" />
                        )}
                    </div>
                    <div className="col-sm mcell mcolor2">
                        <div className="mcell-title story">
                            <b className="fas fa-bars" /> TODO
                            <Tooltips id="2" content="You can do what you want to do with this column" placement="top" storyType={this.props.storyType} />
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Task tasks={tasks} loading={loading} filter="2" />
                        )}
                    </div>
                    <div className="col-sm mcell mcolor3">
                        <div className="mcell-title story">
                            <b className="fas fa-spinner"></b> In Progress
                            <Tooltips id="3" content="You can do what you want to do with this column" placement="top" storyType={this.props.storyType} />
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Task tasks={tasks} loading={loading} filter="3" />
                        )}
                    </div>
                    <div className="col-sm mcell mcolor4">
                        <div className="mcell-title story">
                            <b className="fas fa-check" /> Done
                            <Tooltips id="4" content="You can do what you want to do with this column" placement="top" storyType={this.props.storyType} />
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Task tasks={tasks} loading={loading} filter="4" />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}