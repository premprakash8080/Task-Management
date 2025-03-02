import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTasks, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

const Story = () => {
    const { id } = useParams();
    const [stories, setStories] = useState([
        { id: 1, title: 'User Authentication', status: 'In Progress', tasks: 5 },
        { id: 2, title: 'Dashboard Layout', status: 'Completed', tasks: 3 },
        { id: 3, title: 'API Integration', status: 'Backlog', tasks: 8 }
    ]);

    const handleAddStory = () => {
        // TODO: Implement add story functionality
        console.log('Add story clicked');
    };

    const handleEditStory = (storyId) => {
        // TODO: Implement edit story functionality
        console.log('Edit story:', storyId);
    };

    const handleDeleteStory = (storyId) => {
        // TODO: Implement delete story functionality
        console.log('Delete story:', storyId);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {id ? 'Story Details' : 'Stories'}
                </h1>
                <button 
                    className="btn btn-primary flex items-center"
                    onClick={handleAddStory}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Story
                </button>
            </div>
            
            <div className="grid gap-4">
                {stories.map(story => (
                    <div key={story.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{story.title}</h3>
                                <div className="flex items-center mt-2 space-x-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        story.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        story.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {story.status}
                                    </span>
                                    <span className="flex items-center text-sm text-gray-500">
                                        <FontAwesomeIcon icon={faTasks} className="mr-1" />
                                        {story.tasks} tasks
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    className="p-2 text-gray-500 hover:text-blue-600"
                                    onClick={() => handleEditStory(story.id)}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                    className="p-2 text-gray-500 hover:text-red-600"
                                    onClick={() => handleDeleteStory(story.id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Story; 