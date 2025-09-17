import React from 'react';
import { useLoading } from '../../../contexts/LoadingContext';
import PageLoading from '../../molecules/loading/PageLoading';

const GlobalLoading: React.FC = () => {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <PageLoading
      message={loadingState.message}
      variant={loadingState.variant}
      size="medium"
    />
  );
};

export default GlobalLoading;

