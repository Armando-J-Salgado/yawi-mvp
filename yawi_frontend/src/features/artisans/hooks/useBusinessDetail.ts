import { useQuery } from '@tanstack/react-query';
import { fetchBusinessById } from '@/services/artisans.service';

export function useBusinessDetail(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => fetchBusinessById(id),
    enabled: Boolean(id),
  });
}
