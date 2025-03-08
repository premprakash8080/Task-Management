const fetchMyTasks = async () => {
    try {
        const response = await taskService.getMyTasks(filters);
        
        if (response && response.tasks) {
            if (viewType === 'project') {
                // Group tasks by project, handling null project cases
                const tasksByProject = response.tasks.reduce((acc, task) => {
                    // Handle tasks with no project
                    const projectId = task.project?._id || 'unassigned';
                    const projectTitle = task.project?.title || 'Unassigned Tasks';

                    if (!acc[projectId]) {
                        acc[projectId] = {
                            _id: projectId,
                            projectTitle: projectTitle,
                            tasks: [],
                            taskCount: 0,
                            completedTasks: 0
                        };
                    }
                    acc[projectId].tasks.push(task);
                    acc[projectId].taskCount++;
                    if (task.status === 'done') {
                        acc[projectId].completedTasks++;
                    }
                    return acc;
                }, {});

                setProjectTasks(Object.values(tasksByProject));
            }
            setTasks(response.tasks);
            setError('');
        } else {
            setError('No tasks found');
            setProjectTasks([]);
            setTasks([]);
        }
    } catch (err) {
        console.error('Error fetching my tasks:', err);
        setError(err.message || 'Failed to fetch tasks');
        setProjectTasks([]);
        setTasks([]);
    }
}; 