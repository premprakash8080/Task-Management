import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTasks } from '../../contexts/TasksContext';
import { useUsers } from '../../contexts/UsersContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { useTaskForm } from '../../contexts/TaskFormContext';
import { useFilters } from '../../contexts/FiltersContext';
import { usePagination } from '../../contexts/PaginationContext';
import { useProjectService } from '../../services/ProjectService';
import { useTaskService } from '../../services/TaskService';
import { useUserService } from '../../services/UserService';
import { useTaskFormService } from '../../services/TaskFormService';
import { useFiltersService } from '../../services/FiltersService';
import { usePaginationService } from '../../services/PaginationService';

 