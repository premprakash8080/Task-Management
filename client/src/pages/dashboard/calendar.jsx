import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { calendarService } from '../../components/api';
import moment from 'moment';
import { toast } from 'react-toastify';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        dueDate: '',
        projectId: '',
        priority: 'MEDIUM'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const startDate = moment().startOf('month').format('YYYY-MM-DD');
            const endDate = moment().endOf('month').format('YYYY-MM-DD');
            const data = await calendarService.getCalendarEvents(startDate, endDate);
            setEvents(data);
        } catch (error) {
            toast.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo.startStr);
        setNewEvent(prev => ({ ...prev, dueDate: selectInfo.startStr }));
        setShowEventModal(true);
    };

    const handleEventCreate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await calendarService.createCalendarEvent(newEvent);
            toast.success('Event created successfully');
            setShowEventModal(false);
            setNewEvent({
                title: '',
                description: '',
                dueDate: '',
                projectId: '',
                priority: 'MEDIUM'
            });
            fetchEvents();
        } catch (error) {
            toast.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const EventModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New Event</h3>
                    <button 
                        onClick={() => setShowEventModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleEventCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                            type="date"
                            value={newEvent.dueDate}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            value={newEvent.priority}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowEventModal(true)}
                >
                    <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                    Add Event
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className="calendar-container">
                        {/* Calendar component will be added here */}
                    </div>
                )}
            </div>

            {showEventModal && <EventModal />}
        </div>
    );
};

export default Calendar; 