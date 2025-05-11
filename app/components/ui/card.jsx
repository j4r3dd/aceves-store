'use client';

import * as React from 'react';
import { cn } from '../../../lib/api/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm p-4',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
