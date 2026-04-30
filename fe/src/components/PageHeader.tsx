import { ReactNode } from "react";

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="font-display text-3xl sm:text-4xl text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2 justify-start sm:justify-end">{actions}</div>}
  </div>
);
