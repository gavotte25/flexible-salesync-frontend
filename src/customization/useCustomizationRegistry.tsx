import { useQuery } from 'react-query';
import { fetchActiveCustomizationPoints } from './customizationApi';

/**
 * The tenant's currently active MiSC-Cloud customization points. Empty until a real
 * customization microservice is registered against Tenant Manager for this tenant.
 */
const useCustomizationRegistry = (realm: string) => {
  const { data } = useQuery<string[]>(['customization-registry', realm], () => fetchActiveCustomizationPoints(realm), {
    enabled: !!realm,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  });

  return data ?? [];
};

export default useCustomizationRegistry;
