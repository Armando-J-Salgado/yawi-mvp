import React from 'react';
import type { RegisterStep } from '../../types';

interface RegisterStepIndicatorProps {
  currentStep: RegisterStep;
  step1Label: string;
  step2Label: string;
}

export const RegisterStepIndicator: React.FC<RegisterStepIndicatorProps> = ({
  currentStep,
  step1Label,
  step2Label,
}) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Step 1 */}
      <div className="flex items-center gap-2 flex-1">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            transition-colors duration-300
            ${currentStep >= 1 ? 'bg-primary-navy text-white' : 'bg-border text-muted-text'}
          `}
        >
          1
        </div>
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            currentStep >= 1 ? 'text-primary-text' : 'text-muted-text'
          }`}
        >
          {step1Label}
        </span>
      </div>

      {/* Connector */}
      <div
        className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${
          currentStep >= 2 ? 'bg-primary-navy' : 'bg-border'
        }`}
      />

      {/* Step 2 */}
      <div className="flex items-center gap-2 flex-1">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            transition-colors duration-300
            ${currentStep >= 2 ? 'bg-primary-navy text-white' : 'bg-border text-muted-text'}
          `}
        >
          2
        </div>
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            currentStep >= 2 ? 'text-primary-text' : 'text-muted-text'
          }`}
        >
          {step2Label}
        </span>
      </div>
    </div>
  );
};
