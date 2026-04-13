import './CandidateCard.css';
import { Button } from './Button';
import { ScoreBadge } from './ScoreBadge';

export type ContractType =
  | 'CDI'
  | 'CDD'
  | 'CDIC'
  | 'Freelance'
  | 'Interim'
  | 'Portage'
  | 'Auto';

export interface CandidateCardProps {
  /** Candidate full name */
  name: string;
  /** Candidate role / job title */
  role: string;
  /** Experience expressed in French (e.g. "5 ans") */
  experience: string;
  /** French HR contract type */
  contractType: ContractType;
  /** Optional location string */
  location?: string;
  /** Optional avatar initials (1-3 chars) */
  avatarInitials?: string;
  /** Optional 0-100 matching score */
  score?: number;
  /** Click handler for the "Voir le profil" action */
  onView?: () => void;
  /** Additional CSS class names */
  className?: string;
}

const CONTRACT_CLASS: Record<ContractType, string> = {
  CDI: 'candidate-card-contract-cdi',
  CDD: 'candidate-card-contract-cdd',
  CDIC: 'candidate-card-contract-cdic',
  Freelance: 'candidate-card-contract-freelance',
  Interim: 'candidate-card-contract-interim',
  Portage: 'candidate-card-contract-portage',
  Auto: 'candidate-card-contract-auto',
};

/**
 * CandidateCard — French HR candidate display.
 *
 * Shows name, role, experience, contract preference, location, and an
 * optional matching score. Token-only styling, light + dark.
 */
export function CandidateCard({
  name,
  role,
  experience,
  contractType,
  location,
  avatarInitials,
  score,
  onView,
  className = '',
}: CandidateCardProps) {
  const classes = ['candidate-card', className].filter(Boolean).join(' ');
  const contractClass = ['candidate-card-contract', CONTRACT_CLASS[contractType]].join(' ');

  const initials =
    avatarInitials ??
    name
      .split(' ')
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <article className={classes} role="article" aria-label={`Candidat ${name}`}>
      <header className="candidate-card-header">
        <div className="candidate-card-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="candidate-card-identity">
          <h3 className="candidate-card-name">{name}</h3>
          <p className="candidate-card-role">{role}</p>
        </div>
        {typeof score === 'number' && (
          <div className="candidate-card-score">
            <ScoreBadge value={score} label="Match" size="small" />
          </div>
        )}
      </header>

      <dl className="candidate-card-meta">
        <div className="candidate-card-meta-row">
          <dt className="candidate-card-meta-label">Expérience</dt>
          <dd className="candidate-card-meta-value">{experience}</dd>
        </div>
        {location && (
          <div className="candidate-card-meta-row">
            <dt className="candidate-card-meta-label">Localisation</dt>
            <dd className="candidate-card-meta-value">{location}</dd>
          </div>
        )}
        <div className="candidate-card-meta-row">
          <dt className="candidate-card-meta-label">Contrat</dt>
          <dd className="candidate-card-meta-value">
            <span className={contractClass}>{contractType}</span>
          </dd>
        </div>
      </dl>

      {onView && (
        <footer className="candidate-card-footer">
          <Button variant="secondary" size="small" onClick={onView}>
            Voir le profil
          </Button>
        </footer>
      )}
    </article>
  );
}

export default CandidateCard;
