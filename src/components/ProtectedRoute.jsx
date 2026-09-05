import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AUTH_STORAGE_KEY } from '../pages/Login';

const ProtectedRoute = () => {
  const location = useLocation();

  // Temporary development bypass: restore this block to re-enable login protection.
  // if (sessionStorage.getItem(AUTH_STORAGE_KEY) !== 'true') {
  //   return <Navigate to="/login" replace state={{ from: location }} />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;