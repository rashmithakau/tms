import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../interfaces/IProtectedRouteProps';

const ProtectedRoute:React.FC<IProtectedRouteProps> = ({ isAllowed, children, redirectPath = "/" }: IProtectedRouteProps) => {
  console.log('ProtectedRoute: isAllowed =', isAllowed, 'redirectPath =', redirectPath);
  
  if (!isAllowed) {
    console.log('ProtectedRoute: Access denied, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }
  
  console.log('ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;