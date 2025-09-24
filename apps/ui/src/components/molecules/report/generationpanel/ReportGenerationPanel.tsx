import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { ReportGenerationPanelProps } from '../../../../interfaces/report/generationPanel';
import { useTheme } from '@mui/material/styles';

const ReportGenerationPanel: React.FC<ReportGenerationPanelProps> = ({
  reportMetadata,
  filter,
  isFilterValid,
  isGenerating,
  onGenerateReport,
  error,
  onResetFilters,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>(
    'excel'
  );

  const availableFormats = useMemo(
    () => reportMetadata?.formats ?? [],
    [reportMetadata]
  );

  useEffect(() => {
    const hasSelected = availableFormats.some(
      (f: any) => f.key === selectedFormat
    );
    if (!hasSelected && availableFormats.length > 0) {
      setSelectedFormat(availableFormats[0].key as 'pdf' | 'excel');
    }
  }, [availableFormats, selectedFormat]);

  const handleGenerateReport = () => {
    onGenerateReport(selectedFormat);
  };

  const getFormatIcon = (format: 'pdf' | 'excel') => {
    return format === 'pdf' ? <PdfIcon /> : <ExcelIcon />;
  };

  const getFormatColor = (format: 'pdf' | 'excel') => {
    return format === 'pdf' ? 'error' : 'success';
  };
  const theme = useTheme();
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <FormControl size="small" fullWidth sx={{ m: 0 }}>
            <InputLabel id="format-label">Format</InputLabel>
            <Select
              labelId="format-label"
              value={
                availableFormats.some((f: any) => f.key === selectedFormat)
                  ? selectedFormat
                  : ''
              }
              label="Format"
              onChange={(e) =>
                setSelectedFormat(e.target.value as 'pdf' | 'excel')
              }
              disabled={isGenerating || availableFormats.length === 0}
              size="small"
              sx={{
                '.MuiSelect-select': { py: 0.5 },
                bgcolor: theme.palette.background.default,
              }}
            >
              {availableFormats.map((format) => (
                <MenuItem
                  key={format.key}
                  value={format.key}
                  sx={{
                    fontSize: '0.8rem',
                    minHeight: 28,
                    py: 0.5,
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getFormatIcon(format.key as 'pdf' | 'excel')}
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          lineHeight: 1.2,
                          bgcolor: theme.palette.background.default,
                        }}
                      >
                        {format.name}
                      </Typography>
                      {format.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1,
                          }}
                        >
                          {format.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={
            isGenerating ? (
              <CircularProgress
                size={20}
                sx={{ color: theme.palette.primary.main }}
              />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={handleGenerateReport}
          disabled={!isFilterValid || isGenerating || !reportMetadata}
          sx={{
            minWidth: 120,
            py: 0.5,
            bgcolor:
              getFormatColor(selectedFormat) + theme.palette.primary.main,
            '&:hover': {
              bgcolor:
                getFormatColor(selectedFormat) + theme.palette.text.primary,
            },
          }}
        >
          {isGenerating
            ? 'Generating...'
            : `Generate ${selectedFormat.toUpperCase()} Report`}
        </Button>
      </Box>
    </>
  );
};

export default ReportGenerationPanel;
