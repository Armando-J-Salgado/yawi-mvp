import { useQuery } from '@tanstack/react-query';
import { fetchBusinesses } from '@/services/artisans.service';

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });
}
