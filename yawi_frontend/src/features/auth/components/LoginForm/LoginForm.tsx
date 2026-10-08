import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../components/ui';
import { showToast } from '../../../../components/ui/Toast/useToast';
import { validateLoginForm } from '../../../../utils/validation';
import { useAuthStore } from '../../../../store/authStore';
import type { LoginCredentials } from '../../../../types/auth';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const updateField = (field: keyof LoginCredentials) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formato (no mostrar error por campo — seguridad por oscuridad)
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      // Mostrar error genérico en toast, sin indicar qué campo falló
      showToast.error(t('login.error_invalid_credentials'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showToast.success(t('login.success'));
        // TODO [POST-M3]: Actualizar esta redirección a la página deseada.
        // Actualmente redirige al landing page. Cambiar a '/dashboard', '/cuenta',
        // o la ruta que corresponda cuando se implementen esas páginas.
        navigate('/');
      } else {
        // No revelar si falla email o password (seguridad por oscuridad)
        showToast.error(t('login.error_invalid_credentials'));
      }
    } catch {
      showToast.error(t('login.error_invalid_credentials'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-5">
        <Input
          type="email"
          name="email"
          label={t('login.email_label')}
          placeholder={t('login.email_placeholder')}
          value={formData.email}
          onChange={updateField('email')}
          autoComplete="email"
        />
        <Input
          type="password"
          name="password"
          label={t('login.password_label')}
          placeholder={t('login.password_placeholder')}
          value={formData.password}
          onChange={updateField('password')}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? '...' : t('login.submit')}
        </Button>
      </div>
    </form>
  );
};
