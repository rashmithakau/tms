import React from 'react';
import Container from '@mui/material/Container';

type Props = React.PropsWithChildren<{
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  component?: React.ElementType<any>;
}>;

const SectionContainer: React.FC<Props> = ({ children, maxWidth = 'lg', component: Component }) => {
  return (
    <Container maxWidth={maxWidth} {...(Component ? { component: Component } : {})}>
      {children}
    </Container>
  );
};

export default SectionContainer;


