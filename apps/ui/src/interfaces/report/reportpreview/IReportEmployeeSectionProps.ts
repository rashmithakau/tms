export interface ReportEmployeeSectionProps {
  employeeKey: string;
  employeeData: {
    employeeName: string;
    employeeEmail: string;
    tables: Array<{
      title: string;
      columns: { key: string; header: string }[];
      rows: any[];
    }>;
  };
}
