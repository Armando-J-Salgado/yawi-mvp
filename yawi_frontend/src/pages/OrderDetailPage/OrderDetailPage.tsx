import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useOrderDetail, OrderStatusBadge, OrderItemsList, OrderTotals } from '@/features/orders';

export default function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('orders');
  const { data: order, isLoading, isError, error } = useOrderDetail(id);

  useErrorToast(isError, error, t('detail.error'));

  return (
    <section className="py-12 md:py-16 bg-background min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-indigo hover:text-primary-navy transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('detail.back')}
        </Link>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton height="48px" className="w-1/2" />
            <Skeleton height="220px" className="w-full rounded-card" />
          </div>
        )}

        {!isLoading && (isError || !order) && (
          <div className="bg-surface rounded-card border border-border shadow-card p-10 text-center flex flex-col items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-peach-accent" />
            <p className="text-muted-text">{isError ? t('detail.error') : t('detail.not_found')}</p>
          </div>
        )}

        {!isLoading && order && (
          <div className="space-y-6">
            <div className="bg-surface rounded-card border border-border shadow-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                    {t('detail.order_id')}
                  </p>
                  <h1 className="text-2xl font-extrabold text-primary-navy tracking-tight">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-text">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary-indigo" />
                  {new Date(order.createdAt).toLocaleDateString(i18n.language)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-indigo" />
                  {order.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-card border border-border shadow-card p-6">
              <h2 className="text-lg font-extrabold text-primary-navy tracking-tight mb-2">
                {t('detail.items_title')}
              </h2>
              <OrderItemsList items={order.items} />
            </div>

            <div className="bg-surface rounded-card border border-border shadow-card p-6">
              <OrderTotals
                subtotal={order.subtotal}
                shippingFee={order.shippingFee}
                total={order.total}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
