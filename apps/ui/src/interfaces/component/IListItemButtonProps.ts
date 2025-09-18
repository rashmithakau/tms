import React from 'react';

export interface IListItemButtonProps {
  children: React.ReactNode; 
  onClick?: () => void; 
  sx?: object; 
}