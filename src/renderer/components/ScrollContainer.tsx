import { ReactNode, forwardRef } from 'react';

interface ScrollContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  ({ children, className = '', style }, ref) => {
    return (
      <div
        ref={ref}
        className={`overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 ${className}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) transparent',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

ScrollContainer.displayName = 'ScrollContainer';
