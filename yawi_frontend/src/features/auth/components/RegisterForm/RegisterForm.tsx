import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Button } from '../../../../components/ui';
import { showToast } from '../../../../components/ui/Toast/useToast';
import { RegisterStepIndicator } from './RegisterStepIndicator';
import { useCountries } from '../../hooks/useCountries';
import { validateStep1, validateStep2 } from '../../../../utils/validation';
import { registerUser } from '../../../../services/auth.service';
import type { RegisterFormState, RegisterStep } from '../../types';

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const countries = useCountries();

  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    country: '',
    address: '',
  });

  const updateField = (field: keyof RegisterFormState) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNextStep = () => {
    const step1Errors = validateStep1({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    // Translate error keys
    const translatedErrors: Record<string, string> = {};
    for (const [key, errorKey] of Object.entries(step1Errors)) {
      translatedErrors[key] = t(errorKey);
    }

    if (Object.keys(translatedErrors).length > 0) {
      setErrors(translatedErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const step2Errors = validateStep2({
      name: formData.name,
      lastname: formData.lastname,
      country: formData.country,
      address: formData.address,
    });

    // Translate error keys
    const translatedErrors: Record<string, string> = {};
    for (const [key, errorKey] of Object.entries(step2Errors)) {
      translatedErrors[key] = t(errorKey);
    }

    if (Object.keys(translatedErrors).length > 0) {
      setErrors(translatedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser(formData);

      if (result.success) {
        showToast.success(t('register.success'));
        // Redirigir a login después de registro exitoso
        navigate('/login');
      } else {
        showToast.error(result.error || t('register.error_generic'));
      }
    } catch {
      showToast.error(t('register.error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md mx-auto">
      <RegisterStepIndicator
        currentStep={currentStep}
        step1Label={t('register.step_1_title')}
        step2Label={t('register.step_2_title')}
      />

      {/* Step 1: Credenciales */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-5">
          <Input
            type="email"
            name="email"
            label={t('register.email_label')}
            placeholder={t('register.email_placeholder')}
            value={formData.email}
            onChange={updateField('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            type="password"
            name="password"
            label={t('register.password_label')}
            placeholder={t('register.password_placeholder')}
            value={formData.password}
            onChange={updateField('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            type="password"
            name="confirmPassword"
            label={t('register.confirm_password_label')}
            placeholder={t('register.confirm_password_placeholder')}
            value={formData.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNextStep}
            className="w-full mt-2"
          >
            {t('register.next_step')}
          </Button>
        </div>
      )}

      {/* Step 2: Datos personales */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-5">
          <Input
            type="text"
            name="name"
            label={t('register.name_label')}
            placeholder={t('register.name_placeholder')}
            value={formData.name}
            onChange={updateField('name')}
            error={errors.name}
            autoComplete="given-name"
          />
          <Input
            type="text"
            name="lastname"
            label={t('register.lastname_label')}
            placeholder={t('register.lastname_placeholder')}
            value={formData.lastname}
            onChange={updateField('lastname')}
            error={errors.lastname}
            autoComplete="family-name"
          />
          <Select
            name="country"
            label={t('register.country_label')}
            placeholder={t('register.country_placeholder')}
            value={formData.country}
            onChange={updateField('country')}
            options={countries}
            error={errors.country}
          />
          <Input
            type="text"
            name="address"
            label={t('register.address_label')}
            placeholder={t('register.address_placeholder')}
            value={formData.address}
            onChange={updateField('address')}
            error={errors.address}
            autoComplete="street-address"
          />

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handlePrevStep}
              className="flex-1"
            >
              {t('register.prev_step')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '...' : t('register.submit')}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
