export interface NormalizedInput {
  keywords: string[];
  skills: string[];
  flags: Record<string, string>;
  originalInput: string;
}

const ALIASES: Record<string, string> = {
  // French verbs
  "vérifier": "review",
  "vérif": "review",
  "checker": "check",
  "corriger": "fix",
  "réparer": "fix",
  "fixer": "fix",
  "nettoyer": "clean",
  "refactorer": "refactor",
  "déployer": "deploy",
  "deployer": "deploy",
  "documenter": "docs",
  "tester": "test",

  // French nouns
  "sécurité": "security",
  "sécu": "security",
  "architecture": "architecture",
  "archi": "architecture",
  "factures": "invoices",
  "facture": "invoice",
  "fournisseurs": "suppliers",
  "rapprochement": "reconciliation",

  // Project aliases
  "comptable": "agent-comptable",
  "compta": "agent-comptable",
  "sourcing": "rh-optimerp-sourcing-candidate-attraction",
  "matching": "rh-optimerp-sourcing-candidate-attraction",
  "eagles": "eagles-ai-platform",
  "eaip": "eagles-ai-platform",
  "platform": "eagles-ai-platform",

  // Slang
  "propre": "clean",
  "moche": "ugly",
  "pété": "broken",
  "cassé": "broken",
  "bug": "broken",
  "truc": "thing",
  "machin": "thing",
};

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "be", "been", "do", "does", "did",
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "ou",
  "pour", "dans", "sur", "avec", "par", "en", "au", "aux",
  "me", "moi", "je", "tu", "il", "nous", "vous", "ils",
  "i", "you", "he", "we", "they", "it", "my", "your",
  "can", "could", "would", "should", "please", "want", "need",
  "peux", "peut", "veux", "veut", "faut", "dois", "doit",
  "rendez", "rends", "fait", "faire", "fais",
  "pls", "plz", "svp", "stp", "asap",
  "in", "of", "on", "at", "to", "this", "that",
  "ça", "ca", "c'est", "cest",
]);

const SKILL_PATTERN = /\/[\w-]+/g;
const FLAG_PATTERN = /--(\w+)\s+(\S+)/g;

export function normalize(input: string): NormalizedInput {
  const originalInput = input;

  let text = input.toLowerCase().trim();

  const skills: string[] = [];
  text = text.replace(SKILL_PATTERN, (match) => {
    skills.push(match);
    return " ";
  });

  const flags: Record<string, string> = {};
  text = text.replace(FLAG_PATTERN, (_match, key: string, value: string) => {
    flags[key] = value;
    return " ";
  });

  const words = text.split(/\s+/).filter((w) => w.length > 0);

  const keywords: string[] = [];
  for (const word of words) {
    if (STOPWORDS.has(word)) {
      continue;
    }

    const resolved = ALIASES[word] ?? word;
    keywords.push(resolved);
  }

  return { keywords, skills, flags, originalInput };
}
