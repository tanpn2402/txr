import { Textarea, type TextareaProps } from '@mantine/core';
import { type RefCallback, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

export const FlexibleTextArea: React.FC<
  TextareaProps & {
    ref?: RefCallback<HTMLTextAreaElement>;
  }
> = ({ onFocus, onBlur, ref, ...props }) => {
  const [isFocusing, setIsFocusing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div
      data-component="FlexibleTextArea"
      className={cn([
        'h-full cursor-text border border-[#ced4da] border-l-transparent',
        isFocusing && 'border-l border-[#228be6]',
      ])}
      onClick={() => {
        textareaRef.current?.focus();
      }}
    >
      <Textarea
        {...props}
        ref={(r) => {
          if (r) {
            ref?.(r);
            textareaRef.current = r;
          }
        }}
        onFocus={(ev) => {
          setIsFocusing(true);
          onFocus?.(ev);
        }}
        onBlur={(ev) => {
          setIsFocusing(false);
          onBlur?.(ev);
        }}
        styles={{
          ...props.styles,
          input: {
            borderWidth: 0,
          },
        }}
      />
    </div>
  );
};
