/* eslint-disable @typescript-eslint/no-empty-interface */
{/*import * as React from 'react';
import { cn } from '@/lib/utils'; // if you're using a utility function like in ShadCN (optional)

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-sm font-medium text-gray-700', className)}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';*/}



import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-gray-700', className)}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export { Label };
