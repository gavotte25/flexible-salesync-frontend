import typeApi from '@/api/type';
import { useQuery } from 'react-query';
import useTenant from '../useTenant';

const useTypeRelation = (typeId: string) => {
  const key = ['type-relation', typeId];
  const companyName = useTenant();

  const { data, error, isLoading } = useQuery<TypeRelation[]>(
    key,
    async () => {
      const res = await typeApi.getTypeRelations(companyName ?? '', typeId);
      return res;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
      enabled: !!typeId
    }
  );

  return { data, error, isLoading, key };
};
export default useTypeRelation;
