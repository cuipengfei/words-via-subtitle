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
        className={`overflow-y-auto overflow-x-hidden h-full ${className}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) transparent',
          maxHeight: '100%',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

ScrollContainer.displayName = 'ScrollContainer';
