export interface FilterBySelectProps {
  filterBy: '' | 'user' | 'project' | 'team' | 'status' | null;
  onFilterByChange?: (
    value: '' | 'user' | 'project' | 'team' | 'status'
  ) => void;
  disabled?: boolean;
}
