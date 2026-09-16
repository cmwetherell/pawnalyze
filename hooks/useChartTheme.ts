'use client';

import { useEffect, useState } from 'react';

export interface ChartTheme {
  gridColor: string;
  textColor: string;
  textPrimary: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipBody: string;
}

/** Reads the CSS custom properties chart.js needs (canvas cannot resolve var()) and re-reads on theme toggle. */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>({
    gridColor: '#1f293740',
    textColor: '#8b949e',
    textPrimary: '#f0f2f5',
    tooltipBg: '#1a1d23',
    tooltipBorder: '#2d333b',
    tooltipText: '#f0f2f5',
    tooltipBody: '#c9d1d9',
  });

  useEffect(() => {
    const update = () => {
      const s = getComputedStyle(document.documentElement);
      setTheme({
        gridColor: s.getPropertyValue('--chart-grid').trim() + '40',
        textColor: s.getPropertyValue('--text-muted').trim(),
        textPrimary: s.getPropertyValue('--text-primary').trim(),
        tooltipBg: s.getPropertyValue('--chart-tooltip-bg').trim(),
        tooltipBorder: s.getPropertyValue('--chart-tooltip-border').trim(),
        tooltipText: s.getPropertyValue('--text-primary').trim(),
        tooltipBody: s.getPropertyValue('--text-secondary').trim(),
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
