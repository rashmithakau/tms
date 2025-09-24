import React from 'react';

export interface IStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  backgroundColor?: string;
  textColor?: string;
}
