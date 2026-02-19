import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useRegistrationStore } from '../stores/registrationStore';
import { useTenantStore } from '../stores/tenantStore';
import { useAuthStore } from '../stores/authStore';
import { questionnaireQuestions } from '../mock/data/questionnaire.mock';
import { savePreferences } from '../services/registration.service';

export default function RegisterPreferencesPage() {
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isHe = language === 'he';
  const tenantConfig = useTenantStore((s) => s.config);
  const userId = useAuthStore((s) => s.userId);
  const setProfileCompleted = useAuthStore((s) => s.setProfileCompleted);
  const { setPreferences, completeRegistration } = useRegistrationStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = questionnaireQuestions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const finishAndNavigate = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      setPreferences(finalAnswers);
      await savePreferences(userId ?? '', finalAnswers);
      setProfileCompleted(true);
      completeRegistration();
      navigate(`/${lang}`, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after a brief pause
    setTimeout(() => {
      if (isLastQuestion) {
        finishAndNavigate(newAnswers);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleSkip = () => {
    setPreferences(answers);
    setProfileCompleted(true);
    completeRegistration();
    navigate(`/${lang}`, { replace: true });
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const questionTitle = isHe
    ? currentQuestion.titleHe
    : currentQuestion.titleEn;

  const selectedValue = answers[currentQuestion.id];

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Header */}
      <div className="pt-10 pb-4 px-6">
        {/* Back button + skip */}
        <div className="flex items-center justify-between mb-6">
          {currentIndex > 0 ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center"
            >
              <span
                className="material-symbols-outlined text-text-primary"
                style={{ fontSize: '18px' }}
              >
                arrow_back
              </span>
            </button>
          ) : (
            <div className="w-9" />
          )}

          <button
            onClick={handleSkip}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            {t.registration.skipForNow}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          {tenantConfig ? (
            <img
              src={tenantConfig.logo}
              alt={isHe ? tenantConfig.nameHe : tenantConfig.name}
              className="h-8 mx-auto mb-3 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}

          <h1 className="text-lg font-bold text-text-primary mb-1">
            {t.registration.preferencesTitle}
          </h1>
          <p className="text-xs text-text-muted">
            {t.registration.preferencesSubtitle}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-primary'
                  : idx < currentIndex
                    ? 'w-2 bg-primary/40'
                    : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-6 animate-fade-in" key={currentQuestion.id}>
        <h2 className="text-base font-semibold text-text-primary text-center mb-6">
          {questionTitle}
        </h2>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedValue === option.value;
            const label = isHe ? option.labelHe : option.labelEn;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={isSubmitting}
                className={`relative p-4 rounded-2xl border-2 text-center transition-all active:scale-[0.97] ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <span
                    className="absolute top-2 end-2 material-symbols-outlined text-primary"
                    style={{
                      fontSize: '18px',
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    check_circle
                  </span>
                )}

                {/* Emoji */}
                <div className="text-3xl mb-2">{option.emoji}</div>

                {/* Label */}
                <p
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-4 pb-8">
        {isSubmitting && (
          <div className="flex justify-center py-3">
            <span
              className="material-symbols-outlined text-primary animate-spin"
              style={{ fontSize: '24px' }}
            >
              progress_activity
            </span>
          </div>
        )}

        {/* Powered by Nexus */}
        <p className="text-[10px] text-text-muted/50 text-center mt-2">
          Powered by <span className="font-semibold">Nexus</span>
        </p>
      </div>
    </div>
  );
}
