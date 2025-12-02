 export  interface HeaderLayoutProps {
  logo: React.ReactNode;
  navItems: React.ReactNode;
  signInButton: React.ReactNode;
  isMobile: boolean;
  onMenuClick: () => void;
  drawer?: React.ReactNode;
}


export interface HeroSectionLayoutProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  image?: React.ReactNode;
  background?: string;
  mobileImageFirst?: boolean;
}