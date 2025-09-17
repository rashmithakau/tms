import React from 'react';
import LandingPageLayout from '../components/templates/landing/LandingPageLayout';
import HeroSection from '../components/organisms/landing/HeroSection';
import Features from '../components/organisms/landing/Features';
import UseRole from '../components/organisms/landing/UseRole';

const LandingPage: React.FC = () => {
  return (
    <LandingPageLayout>
      <HeroSection />
      <Features />
      <UseRole />
    </LandingPageLayout>
  );
};

export default LandingPage;
