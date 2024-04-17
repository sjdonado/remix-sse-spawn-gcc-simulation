import type { FC, InputHTMLAttributes } from 'react';
import { useField } from 'remix-validated-form';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

export const Input: FC<InputProps> = ({ name, label, ...rest }) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className="home-input">
      <label htmlFor={name}>{label}</label>
      <input {...rest} {...getInputProps({ id: name })} />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};
