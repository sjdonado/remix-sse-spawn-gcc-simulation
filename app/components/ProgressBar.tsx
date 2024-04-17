import clsx from 'clsx';
import { useState, useEffect } from 'react';

const ProgressBar = ({ progress, message }: { progress: number; message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [progress]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={clsx(
        'loading mx-4 flex flex-col items-center justify-center gap-4',
        'transition-opacity duration-500',
        progress === 100 ? 'opacity-0' : 'opacity-100'
      )}
      onTransitionEnd={() => {
        if (progress === 100) {
          setVisible(false);
        }
      }}
    >
      <div className="h-2.5 w-full rounded-full bg-gray-200 transition-opacity duration-500">
        <div
          className="h-2.5 rounded-full bg-green-600"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm">{message}</p>
    </div>
  );
};

export default ProgressBar;
