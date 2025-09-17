export interface IProtectedRouteProps {
  isAllowed: boolean;
  children: React.ReactNode;
  redirectPath?: string;
}