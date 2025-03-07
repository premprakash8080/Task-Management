import React from 'react';

export const DotPattern = ({
  className = '',
  size = 32,
  radius = 1.5,
  offset = 0,
  invert = false,
}) => {
  const patternId = React.useId();

  return (
    <div className={className}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            x={offset}
            y={offset}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={radius}
              cy={radius}
              r={radius}
              fill={invert ? 'white' : 'currentColor'}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}; 