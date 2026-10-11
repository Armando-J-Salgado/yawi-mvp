import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useOrders, OrdersList } from '@/features/orders';

export default function OrdersPage() {
  const { t } = useTranslation('orders');
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error, refetch } = useOrders(user?.id ?? '');

  useErrorToast(isError, error, t('list.error'));

  return (
    <section className="py-12 md:py-16 bg-background min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-base text-muted-text">{t('subtitle')}</p>

        <div className="mt-8">
          <OrdersList
            orders={data ?? []}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    </section>
  );
}
