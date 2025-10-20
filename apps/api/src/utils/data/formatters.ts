/**
 * Formats role enum value to user-friendly display name
 * @param role - The role enum value (e.g., 'emp', 'admin', etc.)
 * @returns The formatted role display name (e.g., 'employee', 'admin', etc.)
 */
export const formatRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'emp': 'employee',
    'supervisor': 'supervisor',
    'supervisorAdmin': 'supervisor admin',
    'admin': 'admin',
    'superAdmin': 'super admin',
  };
  return roleMap[role] || role;
};
