import { Fragment } from 'react';
import './Stepper.css';

export interface StepperStep {
  /** Stable identifier */
  id: string;
  /** Step label */
  label: string;
  /** Optional supporting description */
  description?: string;
}

export interface StepperProps {
  /** Ordered list of steps */
  steps: StepperStep[];
  /** Zero-based index of the current step */
  currentIndex: number;
  /** Click handler for navigating to a step. When omitted, steps are not interactive. */
  onStepClick?: (index: number) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Stepper — linear progress through a sequence of steps.
 *
 * Steps before currentIndex are completed, the step at currentIndex is current
 * (aria-current="step"), and steps after are upcoming. Provide onStepClick to
 * make steps navigable.
 */
export function Stepper({
  steps,
  currentIndex,
  onStepClick,
  className = '',
}: StepperProps) {
  const classes = ['stepper', className].filter(Boolean).join(' ');
  const interactive = typeof onStepClick === 'function';

  return (
    <ol className={classes} aria-label="Progression">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stateClass = isCurrent
          ? 'stepper-step-current'
          : isComplete
            ? 'stepper-step-complete'
            : 'stepper-step-upcoming';

        const buttonLabel = `Étape ${index + 1}: ${step.label}`;

        return (
          <Fragment key={step.id}>
            <li
              className={['stepper-step', stateClass].join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {interactive ? (
                <button
                  type="button"
                  className="stepper-step-button"
                  aria-label={buttonLabel}
                  onClick={() => onStepClick?.(index)}
                >
                  <span className="stepper-step-indicator" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="stepper-step-text">
                    <span className="stepper-step-label">{step.label}</span>
                    {step.description && (
                      <span className="stepper-step-description">
                        {step.description}
                      </span>
                    )}
                  </span>
                </button>
              ) : (
                <div className="stepper-step-static">
                  <span className="stepper-step-indicator" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="stepper-step-text">
                    <span className="stepper-step-label">{step.label}</span>
                    {step.description && (
                      <span className="stepper-step-description">
                        {step.description}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </li>
            {index < steps.length - 1 && (
              <li
                className="stepper-connector"
                aria-hidden="true"
                role="presentation"
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

export default Stepper;
