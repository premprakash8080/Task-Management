import React from 'react';
import { motion } from 'framer-motion';

export const RippleButton = ({
  children,
  as: Component = 'button',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const [ripples, setRipples] = React.useState([]);

  const addRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    const ripple = { x, y, size };
    setRipples([...ripples, ripple]);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (ripples.length > 0) {
        setRipples(ripples.slice(1));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <Component
      className={`relative overflow-hidden ${className}`}
      onClick={addRipple}
      {...props}
    >
      {ripples.map((ripple, index) => (
        <motion.span
          key={index}
          initial={{ transform: 'scale(0)', opacity: 0.5 }}
          animate={{ transform: 'scale(4)', opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </Component>
  );
}; 