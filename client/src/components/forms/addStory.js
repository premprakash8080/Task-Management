import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from 'reactstrap';
import axios from 'axios';

class AddStory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            title: '',
            createdBy: '',
        };

        this.toggle = this.toggle.bind(this);
    }

    handleInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleClick = () => {
        const storyData = {
            title: this.state.title,
            createdBy: this.state.createdBy,
        };

        console.log("Sending data to server:", storyData);

        axios.post('http://localhost:9000/story', storyData)
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                } else {
                    console.log("Story added successfully:", response.data);
                    
                    // Update parent component with new story and fetch its tasks
                    this.props.onAddStory(response.data);
                    this.props.fetchTasks(response.data.storyId);

                    this.toggle();
                    this.setState({
                        title: '',
                        createdBy: '',
                    });
                }
            })
            .catch((error) => {
                console.error("There was an error posting the data:", error);
            });
    };

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    render() {
        return (
            <div>
                <Button color="secondary" onClick={this.toggle}><i className="fas fa-plus-circle" /> Add Project</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>
                        Add Story
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup><Label for="title">Story Title(*):</Label><Input type="text" name="title" onChange={this.handleInput} /></FormGroup>
                        <FormGroup><Label for="createdBy">Created by(*):</Label><Input type="text" name="createdBy" onChange={this.handleInput} /></FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleClick}><i className="fas fa-plus-circle"></i> Add</Button>
                        <Button color="secondary" onClick={this.toggle}><i className="fas fa-times-circle"></i> Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default AddStory;