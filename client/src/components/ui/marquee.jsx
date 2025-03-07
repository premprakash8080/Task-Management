import React from 'react';
import { motion } from 'framer-motion';

export const Marquee = ({
  children,
  direction = 'left',
  pauseOnHover = true,
  speed = 50,
  className = '',
}) => {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [duplicates, setDuplicates] = React.useState(1);

  React.useEffect(() => {
    if (containerRef.current) {
      const calculateDuplicates = () => {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = containerRef.current.scrollWidth;
        return Math.ceil((containerWidth * 2) / contentWidth) + 1;
      };

      setContainerWidth(containerRef.current.offsetWidth);
      setDuplicates(calculateDuplicates());

      const resizeObserver = new ResizeObserver(() => {
        setContainerWidth(containerRef.current.offsetWidth);
        setDuplicates(calculateDuplicates());
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex"
        animate={{
          x: direction === 'left' ? [-containerWidth, 0] : [0, -containerWidth],
        }}
        transition={{
          duration: containerWidth / speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        {...(pauseOnHover && {
          whileHover: { animationPlayState: 'paused' },
        })}
      >
        {Array(duplicates)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex shrink-0"
              style={{ marginLeft: index === 0 ? undefined : '2rem' }}
            >
              {children}
            </div>
          ))}
      </motion.div>
    </div>
  );
}; 