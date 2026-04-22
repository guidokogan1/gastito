import * as React from "react";

import { cn } from "@/lib/utils";

export function TableContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="table-container" className={cn("table-container", className)} {...props} />;
}

export const Table = React.forwardRef<HTMLTableElement, React.ComponentProps<"table">>(
  ({ className, ...props }, ref) => (
    <table ref={ref} data-slot="table" className={cn("table-root", className)} {...props} />
  ),
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"thead">>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} data-slot="table-header" className={cn("table-head", className)} {...props} />
  ),
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tbody">>(
  ({ className, ...props }, ref) => <tbody ref={ref} data-slot="table-body" className={cn(className)} {...props} />,
);
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tfoot">>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} data-slot="table-footer" className={cn("bg-muted/30", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.ComponentProps<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn("table-row-hover border-b border-border/50 last:border-b-0", className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ComponentProps<"th">>(
  ({ className, ...props }, ref) => (
    <th ref={ref} data-slot="table-head" className={cn("table-head-cell", className)} {...props} />
  ),
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentProps<"td">>(
  ({ className, ...props }, ref) => (
    <td ref={ref} data-slot="table-cell" className={cn("table-cell", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<"caption">>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-left text-sm", className)}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";

