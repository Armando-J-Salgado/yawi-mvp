import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../../features/auth';

export default function RegisterPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight leading-tight">
          {t('register.title')}
        </h1>
        <p className="mt-3 text-base text-muted-text">{t('register.subtitle')}</p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Link to login */}
      <p className="mt-8 text-center text-sm text-muted-text">
        {t('register.has_account')}{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
        >
          {t('register.login_link')}
        </Link>
      </p>
    </div>
  );
}
