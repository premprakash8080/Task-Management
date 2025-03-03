import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTag,
    faPlus,
    faEdit,
    faTrash,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { labelService } from './api';

const LabelManager = ({ projectId, onLabelSelect }) => {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [labelForm, setLabelForm] = useState({
        name: '',
        color: '#000000',
        description: ''
    });

    useEffect(() => {
        if (projectId) {
            fetchLabels();
        }
    }, [projectId]);

    const fetchLabels = async () => {
        try {
            setLoading(true);
            const data = await labelService.getLabels(projectId);
            setLabels(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch labels');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedLabel) {
                await labelService.updateLabel(selectedLabel._id, {
                    ...labelForm,
                    projectId
                });
            } else {
                await labelService.createLabel({
                    ...labelForm,
                    projectId
                });
            }
            await fetchLabels();
            setShowModal(false);
            setLabelForm({
                name: '',
                color: '#000000',
                description: ''
            });
            setSelectedLabel(null);
        } catch (err) {
            setError(err.message || 'Failed to save label');
        }
    };

    const handleDelete = async (labelId) => {
        if (window.confirm('Are you sure you want to delete this label?')) {
            try {
                await labelService.deleteLabel(labelId);
                await fetchLabels();
            } catch (err) {
                setError(err.message || 'Failed to delete label');
            }
        }
    };

    const handleEdit = (label) => {
        setSelectedLabel(label);
        setLabelForm({
            name: label.name,
            color: label.color,
            description: label.description || ''
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Labels List */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Labels</h3>
                <button
                    onClick={() => {
                        setSelectedLabel(null);
                        setLabelForm({
                            name: '',
                            color: '#000000',
                            description: ''
                        });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add Label
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {labels.map(label => (
                    <div
                        key={label._id}
                        className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-50"
                    >
                        <div 
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => onLabelSelect && onLabelSelect(label)}
                        >
                            <span
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: label.color }}
                            ></span>
                            <span className="text-sm font-medium">{label.name}</span>
                            {label.description && (
                                <span className="text-xs text-gray-500 ml-2">
                                    {label.description}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleEdit(label)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                                onClick={() => handleDelete(label._id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Label Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedLabel ? 'Edit Label' : 'Create Label'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={labelForm.name}
                                    onChange={(e) => setLabelForm(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={labelForm.color}
                                    onChange={(e) => setLabelForm(prev => ({
                                        ...prev,
                                        color: e.target.value
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={labelForm.description}
                                    onChange={(e) => setLabelForm(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    {selectedLabel ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabelManager; 