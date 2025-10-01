import { ProfessionalPDFConfig } from '../../interfaces/report';

// Default professional configuration
export const DEFAULT_PROFESSIONAL_CONFIG: ProfessionalPDFConfig = {
  company: {
    name: 'Time Management System',
    address: 'Human Resources Department',
    website: 'https://company.com',
  },

  colors: {
    primary: '#2563EB',      
    secondary: '#64748B',   
    accent: '#059669',      
    danger: '#DC2626',      
    warning: '#D97706',    
    background: '#F8FAFC',   
    border: '#E2E8F0',      
    text: {
      primary: '#1E293B',    
      secondary: '#64748B', 
      muted: '#94A3B8'       
    }
  },

  fonts: {
    primary: 'Helvetica',
    bold: 'Helvetica-Bold',
    sizes: {
      title: 22,
      subtitle: 16,
      header: 14,
      body: 10,
      small: 8
    }
  },

  layout: {
    pageMargin: 40,
    headerHeight: 120,
    footerHeight: 60,
    sectionSpacing: 20
  },

  features: {
    watermark: false,
    pageNumbers: true,
    tableOfContents: false,
    executiveSummary: true,
    recommendations: true,
    charts: true
  },

  reports: {
    submissionStatus: {
      includeAnalytics: true,
      showTrends: true,
      highlightIssues: true
    },
    approvalStatus: {
      includeWorkflow: true,
      showProcessingTime: true,
      includeRecommendations: true
    },
    detailedTimesheet: {
      includeProjectBreakdown: true,
      showProductivityMetrics: true,
      includeUtilizationAnalysis: true
    }
  }
};

// Alternative color schemes
export const COLOR_SCHEMES = {
  corporate: {
    primary: '#1F2937',
    secondary: '#6B7280',
    accent: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#F9FAFB',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF'
    }
  },
  
  modern: {
    primary: '#7C3AED',
    secondary: '#64748B',
    accent: '#06B6D4',
    danger: '#DC2626',
    warning: '#EA580C',
    background: '#FAFAFA',
    border: '#E4E4E7',
    text: {
      primary: '#18181B',
      secondary: '#52525B',
      muted: '#A1A1AA'
    }
  },

  healthcare: {
    primary: '#0369A1',
    secondary: '#64748B',
    accent: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    background: '#F0F9FF',
    border: '#BAE6FD',
    text: {
      primary: '#0C4A6E',
      secondary: '#0369A1',
      muted: '#64748B'
    }
  }
};

// Utility function to create custom config
export function createProfessionalConfig(
  overrides: Partial<ProfessionalPDFConfig>
): ProfessionalPDFConfig {
  return {
    ...DEFAULT_PROFESSIONAL_CONFIG,
    ...overrides,
    company: {
      ...DEFAULT_PROFESSIONAL_CONFIG.company,
      ...overrides.company
    },
    colors: {
      ...DEFAULT_PROFESSIONAL_CONFIG.colors,
      ...overrides.colors,
      text: {
        ...DEFAULT_PROFESSIONAL_CONFIG.colors.text,
        ...overrides.colors?.text
      }
    },
    fonts: {
      ...DEFAULT_PROFESSIONAL_CONFIG.fonts,
      ...overrides.fonts,
      sizes: {
        ...DEFAULT_PROFESSIONAL_CONFIG.fonts.sizes,
        ...overrides.fonts?.sizes
      }
    },
    layout: {
      ...DEFAULT_PROFESSIONAL_CONFIG.layout,
      ...overrides.layout
    },
    features: {
      ...DEFAULT_PROFESSIONAL_CONFIG.features,
      ...overrides.features
    },
    reports: {
      ...DEFAULT_PROFESSIONAL_CONFIG.reports,
      ...overrides.reports,
      submissionStatus: {
        ...DEFAULT_PROFESSIONAL_CONFIG.reports.submissionStatus,
        ...overrides.reports?.submissionStatus
      },
      approvalStatus: {
        ...DEFAULT_PROFESSIONAL_CONFIG.reports.approvalStatus,
        ...overrides.reports?.approvalStatus
      },
      detailedTimesheet: {
        ...DEFAULT_PROFESSIONAL_CONFIG.reports.detailedTimesheet,
        ...overrides.reports?.detailedTimesheet
      }
    }
  };
}