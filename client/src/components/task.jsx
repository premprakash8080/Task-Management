import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import Modal from './modal';

const Task = ({ tasks, loading, filter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const initialized = useRef(false);

    useEffect(() => {
        const initializeDragDrop = () => {
            if (window.jQuery && window.jQuery.ui) {
                const $ = window.jQuery;
                
                // Only initialize if not already initialized
                if (!initialized.current) {
                    $('.mcell-task').draggable({
                        revert: 'invalid',
                        containment: 'document',
                        helper: 'clone',
                        cursor: 'move',
                        start: function(event, ui) {
                            $(this).addClass('task-being-dragged');
                            ui.helper.addClass('task-drag-helper');
                        },
                        stop: function() {
                            $(this).removeClass('task-being-dragged');
                        }
                    });

                    $('.mcell').droppable({
                        accept: '.mcell-task',
                        hoverClass: 'drop-hover',
                        drop: function(event, ui) {
                            const taskId = ui.draggable.attr('data-task-id');
                            const newStatus = $(this).attr('data-status');
                            // Handle the status update here
                            console.log(`Task ${taskId} moved to status ${newStatus}`);
                        }
                    });

                    initialized.current = true;
                }
            }
        };

        // Initialize after a short delay to ensure DOM is ready
        const timer = setTimeout(initializeDragDrop, 500);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (window.jQuery && window.jQuery.ui && initialized.current) {
                const $ = window.jQuery;
                try {
                    if ($('.mcell-task').data('ui-draggable')) {
                        $('.mcell-task').draggable('destroy');
                    }
                    if ($('.mcell').data('ui-droppable')) {
                        $('.mcell').droppable('destroy');
                    }
                } catch (e) {
                    console.log('Cleanup error:', e);
                }
                initialized.current = false;
            }
        };
    }, [tasks]);

    const toggleModal = (task = null) => {
        setSelectedTask(task);
        setIsModalOpen(!isModalOpen);
    };

    const handleTaskUpdate = (updatedTask) => {
        // Handle the task update here
        console.log('Task updated:', updatedTask);
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    const filteredTasks = tasks.filter(task => Number(task.status) === Number(filter));

    return (
        <div className="task-container">
            {filteredTasks.map((task) => (
                <div
                    key={task._id || task.id}
                    className="mcell-task"
                    data-task-id={task._id || task.id}
                >
                    <div className="task-header">
                        <span className="task-title">{task.title}</span>
                        <button
                            className="btnDashboard btn btn-primary btn-sm"
                            onClick={() => toggleModal(task)}
                        >
                            <i className="fas fa-arrow-alt-circle-right"/>
                        </button>
                    </div>
                    <div className="task-content">{task.content}</div>
                    {task.dueDate && (
                        <div className="task-footer">
                            <span className="task-due-date">
                                <i className="fas fa-calendar-alt"/> Due: {moment(task.dueDate).format('MMM D')}
                            </span>
                        </div>
                    )}
                </div>
            ))}

            <Modal
                isOpen={isModalOpen}
                toggle={() => toggleModal()}
                task={selectedTask}
                onTaskUpdate={handleTaskUpdate}
            />
        </div>
    );
};

export default Task;