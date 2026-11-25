import type { ReactNode } from 'react';

import { Disclosure } from './Disclosure';
import { Table, TBody, Td, Th, THead } from './Table';

interface TableFallbackProps {
  summary?: string;
  columns: string[];
  rows: ReactNode[][];
  className?: string;
}

/** The same numbers as a table, under every chart. The one table that may scroll sideways. */
export function TableFallback({ summary = 'Show as a table', columns, rows, className }: TableFallbackProps) {
  return (
    <Disclosure summary={summary} className={className}>
      <Table density="compact" label={summary} scroll>
        <THead><tr>{columns.map((c, i) => <Th key={i} align={i === 0 ? 'left' : 'right'}>{c}</Th>)}</tr></THead>
        <TBody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <Td key={j} header={j === 0} align={j === 0 ? 'left' : 'right'} className="whitespace-nowrap">{c}</Td>)}</tr>
          ))}
        </TBody>
      </Table>
    </Disclosure>
  );
}
