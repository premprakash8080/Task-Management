import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from 'reactstrap';
import moment from 'moment';

const ModalExample = ({ isOpen, toggle, task, onTaskUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        content: task.content || '',
        status: task.status || ''
      });
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/tasks/${task.id}`, formData);
      if (response.status === 200) {
        onTaskUpdate(response.data);
        toggle();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={toggle}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Task</h5>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="content">Description</label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                className="form-control"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="0">Backlog</option>
                <option value="1">Todo</option>
                <option value="2">In Progress</option>
                <option value="3">Done</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={toggle}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalExample;