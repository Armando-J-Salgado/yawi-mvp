import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../../features/auth';

export default function LoginPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight leading-tight">
          {t('login.title')}
        </h1>
        <p className="mt-3 text-base text-muted-text">{t('login.subtitle')}</p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Link to register */}
      <p className="mt-8 text-center text-sm text-muted-text">
        {t('login.no_account')}{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
        >
          {t('login.register_link')}
        </Link>
      </p>
    </div>
  );
}
