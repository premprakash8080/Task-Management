import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';
import AddTask from './forms/addTask';

const Tooltips = ({ id, placement, content, storyType }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <span className="tooltip-wrapper">
      <i 
        className="fas fa-question-circle text-gray-400 hover:text-gray-600 transition-colors" 
        id={`Tooltip-${id}`} 
      />
      <Tooltip
        placement={placement}
        isOpen={tooltipOpen}
        target={`Tooltip-${id}`}
        toggle={toggle}
        fade={true}
        transition={{ timeout: 200 }}
      >
        {content}
      </Tooltip>
      
      <AddTask storyType={storyType} status={id} />
    </span>
  );
};

export default Tooltips;