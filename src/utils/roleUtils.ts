// Utility functions for role-based access control
export const hasRole = (user: { roles?: string[], role?: string }, roleToCheck: string): boolean => {
  const userRoles = user.roles || [user.role || 'team_admin'];
  return userRoles.includes(roleToCheck);
};

export const hasAnyRole = (user: { roles?: string[], role?: string }, rolesToCheck: string[]): boolean => {
  const userRoles = user.roles || [user.role || 'team_admin'];
  return rolesToCheck.some(role => userRoles.includes(role));
};

export const isAdmin = (user: { roles?: string[], role?: string }): boolean => {
  return hasRole(user, 'admin');
};

export const canAccessAdminPanel = (user: { roles?: string[], role?: string }): boolean => {
  return hasAnyRole(user, ['admin', 'organizer']);
};

export const canAccessOrganizerPanel = (user: { roles?: string[], role?: string }): boolean => {
  return hasAnyRole(user, ['admin', 'organizer']);
};

export const canAccessRefereePanel = (user: { roles?: string[], role?: string }): boolean => {
  return hasAnyRole(user, ['admin', 'referee']);
};

export const canAccessTeamPanel = (user: { roles?: string[], role?: string }): boolean => {
  return hasAnyRole(user, ['admin', 'team_admin']);
};