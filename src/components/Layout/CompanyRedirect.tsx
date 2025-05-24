import useTenant from '@/hooks/useTenant';
import { Navigate } from 'react-router-dom';

const CompanyRedirect = () => {
  const companyName = useTenant();

  if (!companyName) {
    return <Navigate to='/' />;
  }

  return <Navigate to={`/private/section/home`} />;
};

export default CompanyRedirect;
