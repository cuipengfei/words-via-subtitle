import { render, screen } from '@testing-library/react';
import { ScrollContainer } from '../../../src/renderer/components/ScrollContainer';
import { describe, expect, it, vi } from 'vitest';

describe('ScrollContainer', () => {
  it('renders children correctly', () => {
    render(
      <ScrollContainer>
        <div data-testid="test-child">Test content</div>
      </ScrollContainer>
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test content');
  });

  it('applies default class names', () => {
    render(
      <ScrollContainer>
        <div>Test content</div>
      </ScrollContainer>
    );

    const container = screen.getByText('Test content').parentElement;
    expect(container).toHaveClass('overflow-y-auto');
    expect(container).toHaveClass('overflow-x-hidden');
    expect(container).toHaveClass('h-full');
  });

  it('applies custom class names when provided', () => {
    render(
      <ScrollContainer className="test-class">
        <div>Test content</div>
      </ScrollContainer>
    );

    const container = screen.getByText('Test content').parentElement;
    expect(container).toHaveClass('test-class');
    expect(container).toHaveClass('overflow-y-auto'); // Default classes should still be applied
  });
  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red', padding: '10px' };

    render(
      <ScrollContainer style={customStyle}>
        <div>Test content</div>
      </ScrollContainer>
    );
    const container = screen.getByText('Test content').parentElement;

    // 确保 container 不为 null
    expect(container).not.toBeNull();

    // 检查样式是否应用，但不检查精确的 CSS 值
    const styles = window.getComputedStyle(container as HTMLElement);
    expect(styles.padding).toBe('10px');
    // 颜色可能以 rgb 形式呈现，所以只检查是否有某种形式的红色
    expect(styles.backgroundColor).toMatch(/red|rgb\(255/i);
    // Default styles should also be applied
    expect(container).toHaveStyle('scrollbar-width: thin');
    expect(container).toHaveStyle('max-height: 100%');
  });

  it('forwards ref correctly to the div element', () => {
    const refCallback = vi.fn();

    render(
      <ScrollContainer ref={refCallback}>
        <div>Test content</div>
      </ScrollContainer>
    );

    expect(refCallback).toHaveBeenCalledTimes(1);
    expect(refCallback.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
