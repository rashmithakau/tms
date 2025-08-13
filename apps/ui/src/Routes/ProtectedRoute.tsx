import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../interfaces/IProtectedRouteProps';

const ProtectedRoute:React.FC<IProtectedRouteProps> = ({ isAllowed, children, redirectPath = "/" }: IProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;