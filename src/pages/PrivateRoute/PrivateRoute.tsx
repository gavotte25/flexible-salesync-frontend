import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';
import useAuth from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?redirectUrl=${redirectUrl}`} />;
  }

  return <Outlet />;
};
export default PrivateRoute;
