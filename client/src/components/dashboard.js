import React, { Component } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Story from './story';
import AddStory from './forms/addStory';
import Loader from './loader';
import Header from './common/header';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            show: true,
            tasks: [],
            stories: [],
            err: '',
            err2: '',
            loading: true,
            loadingStory: true
        };

        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.getStoryDetails();
        this.getData();
        this.dataInterval = setInterval(this.getData, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.dataInterval);
    }

    getStoryDetails = () => {
        axios.get('http://localhost:9000/story')
            .then((r) => {
                if (r.data.success) {
                    this.setState({
                        stories: r.data.data,
                        err2: ''
                    });
                } else {
                    this.setState({
                        err2: r.data.message
                    });
                }
            })
            .then(() => {
                this.setState({
                    loadingStory: false
                });
            })
            .catch((e) => {
                this.setState({
                    loadingStory: false,
                    err2: e.message
                });
            });
    }

    getData = () => {
        const { id } = this.props.params;
        if (id) {
            axios.get(`http://localhost:9000/tasks/${id}`)
                .then((r) => {
                    console.log("Fetched tasks for story:", r.data);
                    this.setState({
                        tasks: r.data,
                        err: ''
                    });
                })
                .catch((e) => {
                    if (!e.response) {
                        this.setState({
                            loading: true,
                            err: e
                        });
                    } else {
                        this.setState({
                            loading: false,
                            err: e
                        });
                    }
                });
        } else {
            console.error("ID is undefined");
        }
    }

    render() {
        let { stories, loadingStory } = this.state;
        let storyTable;
        if (!loadingStory)
            storyTable = stories.map((story, index) => {
                return (
                    <li key={index}>
                        <Link to={`/story/${story.storyId}`} className="active">
                            <i className="fas fa-list-alt"></i>
                            <span className="menu-text">{story.title}</span>
                        </Link>
                    </li>
                );
            });
        else
            storyTable = <li>
                <div className="loader">
                    <Loader />
                </div>
            </li>;

        return (
            <div>
                <div className="side">
                    <span className="logo">Scrum Beta</span>
                    <ul className="side-menu">
                        {storyTable}
                    </ul>
                    <div className="otherMenu">
                        <AddStory onAddStory={this.addStory} fetchTasks={this.getData} />
                    </div>
                </div>
                <div className="con">
                    <Header />
                    <aside>
                        {this.state.stories.length > 0 ? (
                            <Story
                                storyName={this.state.stories.filter(i => i.storyId === parseInt(this.props.params.id))}
                                storyType={this.props.params.id}
                                tasks={this.state.tasks}
                                loading={this.state.loading}
                                storyId={this.props.params.id}
                            />
                        ) : (
                            <div>No stories available.</div>
                        )}
                    </aside>
                </div>
            </div>
        );
    }
}

const DashboardWrapper = (props) => {
    const params = useParams();
    return <Dashboard {...props} params={params} />;
};

export default DashboardWrapper;