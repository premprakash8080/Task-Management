import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faCheckCircle,
    faClock,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const ProjectOverview = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const projectsData = await dashboardService.getProjectOverview();
            setProjects(projectsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const getProjectStatus = (project) => {
        const { taskStats } = project;
        if (!taskStats || taskStats.total === 0) {
            return { icon: faClock, color: 'text-yellow-500', text: 'No Tasks' };
        }

        const completionRate = (taskStats.completed / taskStats.total) * 100;
        
        if (completionRate === 100) {
            return { icon: faCheckCircle, color: 'text-green-500', text: 'Completed' };
        } else if (completionRate >= 50) {
            return { icon: faClock, color: 'text-yellow-500', text: 'In Progress' };
        } else {
            return { icon: faExclamationTriangle, color: 'text-red-500', text: 'Behind Schedule' };
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
                const status = getProjectStatus(project);
                const completionPercentage = project.taskStats?.total > 0 
                    ? Math.round((project.taskStats.completed / project.taskStats.total) * 100) 
                    : 0;

                return (
                    <Link 
                        key={project._id} 
                        to={`/dashboard/projects/${project._id}`}
                        className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <FontAwesomeIcon 
                                icon={status.icon} 
                                className={`${status.color} text-xl`}
                                title={status.text}
                            />
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                <span>{project.members?.length || 0} Members</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {project.taskStats?.total > 0 
                                    ? `${project.taskStats.completed}/${project.taskStats.total} Tasks` 
                                    : 'No Tasks'}
                            </div>
                        </div>

                        {project.members && project.members.length > 0 && (
                            <div className="mt-4 flex -space-x-2">
                                {project.members.slice(0, 5).map(member => {
                                    if (!member || !member._id) return null;

                                    const memberName = member.name || 'Unknown';
                                    const memberInitial = memberName.charAt(0) || '?';

                                    return (
                                        <div 
                                            key={member._id}
                                            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                                            title={memberName}
                                        >
                                            {member.avatar ? (
                                                <img 
                                                    src={member.avatar}
                                                    alt={memberName}
                                                    className="w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium">
                                                    {memberInitial}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                {project.members.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                        <span className="text-sm text-gray-600">
                                            +{project.members.length - 5}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

export default ProjectOverview; 