

import { FC } from "react";

interface ExampleProps {
  title?: string;
  children: React.ReactNode;
}

export const Example: FC<ExampleProps> = ({ title = "Default Title", children }) => {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <h2 className="text-lg font-semibold mb-2 font-[family-name:var(--font-geist-sans)]">
        {title}
      </h2>
      <div className="text-sm">
        {children}
      </div>
    </div>
  );
};
