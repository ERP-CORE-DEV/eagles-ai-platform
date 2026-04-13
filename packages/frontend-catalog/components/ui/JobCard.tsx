import './JobCard.css';
import { Button } from './Button';
import { ScoreBadge } from './ScoreBadge';

export type JobContractType =
  | 'CDI'
  | 'CDD'
  | 'CDIC'
  | 'Freelance'
  | 'Interim'
  | 'Portage'
  | 'Auto';

export interface JobCardProps {
  /** Job title */
  title: string;
  /** Hiring company name */
  company: string;
  /** Job location (city, region) */
  location: string;
  /** French HR contract type */
  contractType: JobContractType;
  /** Optional minimum salary in thousands of euros */
  salaryMin?: number;
  /** Optional maximum salary in thousands of euros */
  salaryMax?: number;
  /** Posted date in human-readable form (e.g. "il y a 3 jours") */
  postedAgo: string;
  /** Optional 0-100 matching score */
  matchScore?: number;
  /** Click handler for the "Postuler" action */
  onApply?: () => void;
  /** Additional CSS class names */
  className?: string;
}

const CONTRACT_CLASS: Record<JobContractType, string> = {
  CDI: 'job-card-contract-cdi',
  CDD: 'job-card-contract-cdd',
  CDIC: 'job-card-contract-cdic',
  Freelance: 'job-card-contract-freelance',
  Interim: 'job-card-contract-interim',
  Portage: 'job-card-contract-portage',
  Auto: 'job-card-contract-auto',
};

function formatSalary(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min}-${max}k€/an`;
  if (min != null) return `À partir de ${min}k€/an`;
  return `Jusqu'à ${max}k€/an`;
}

/**
 * JobCard — French job posting display.
 *
 * Shows title, company, location, contract pill, salary range, and an
 * optional matching score. Token-only styling, light + dark.
 */
export function JobCard({
  title,
  company,
  location,
  contractType,
  salaryMin,
  salaryMax,
  postedAgo,
  matchScore,
  onApply,
  className = '',
}: JobCardProps) {
  const classes = ['job-card', className].filter(Boolean).join(' ');
  const contractClass = ['job-card-contract', CONTRACT_CLASS[contractType]].join(' ');
  const salaryLabel = formatSalary(salaryMin, salaryMax);

  return (
    <article className={classes} role="article" aria-label={`Offre ${title} chez ${company}`}>
      <header className="job-card-header">
        <div className="job-card-identity">
          <h3 className="job-card-title">{title}</h3>
          <p className="job-card-company">{company}</p>
        </div>
        {typeof matchScore === 'number' && (
          <div className="job-card-score">
            <ScoreBadge value={matchScore} label="Match" size="small" />
          </div>
        )}
      </header>

      <div className="job-card-tags">
        <span className={contractClass}>{contractType}</span>
        <span className="job-card-tag">{location}</span>
        {salaryLabel && <span className="job-card-tag">{salaryLabel}</span>}
      </div>

      <footer className="job-card-footer">
        <span className="job-card-posted">{postedAgo}</span>
        {onApply && (
          <Button variant="primary" size="small" onClick={onApply}>
            Postuler
          </Button>
        )}
      </footer>
    </article>
  );
}

export default JobCard;
