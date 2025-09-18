export interface IProjectTableToolbarProps {
  billable: 'all' | 'Yes' | 'No';
  onBillableChange: (val: 'all' | 'Yes' | 'No') => void;
}