'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, Transition, motion } from 'framer-motion';
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
} from 'react';

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<{ 'data-id': string }>[]
    | ReactElement<{ 'data-id': string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
  layoutId?: string;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
  layoutId,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();
  const resolvedLayoutId = layoutId ? `background-${layoutId}` : `background-${uniqueId}`;

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child: any, index) => {
    if (!child || !child.props) return child;
    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: (e: React.MouseEvent) => {
            child.props.onMouseEnter?.(e);
            handleSetActiveId(id);
          },
          onMouseLeave: (e: React.MouseEvent) => {
            child.props.onMouseLeave?.(e);
            handleSetActiveId(null);
          },
        }
      : {
          onClick: (e: React.MouseEvent) => {
            child.props.onClick?.(e);
            handleSetActiveId(id);
          },
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'aria-selected': activeId === id,
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={resolvedLayoutId}
              className={cn('absolute inset-0 pointer-events-none', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <span
          data-slot="animated-tab-label"
          className="z-10 flex flex-1 items-center justify-[inherit] gap-[inherit] min-w-0"
        >
          {child.props.children}
        </span>
      </>
    );
  });
}

export default AnimatedBackground;
