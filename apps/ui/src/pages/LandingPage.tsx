import React from 'react';
import LandingPageLayout from '../components/templates/LandingPageLayout';
import HeroSection from '../components/organisms/Landing/HeroSection';
import Features from '../components/organisms/Landing/Features';
import UseRole from '../components/organisms/Landing/UseRole';

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
