export type TeamMemberKey =
  | "marianMinosa"
  | "jocelynFernando"
  | "aileenJoyEgot"
  | "alexisPacapac";

export type TeamTier = "executive" | "operational";

export type TeamMemberBase = {
  key: TeamMemberKey;
  name: string;
  tier: TeamTier;
  initials: string;
  image?: string;
};

export const EXECUTIVE_TEAM: TeamMemberBase[] = [
  {
    key: "marianMinosa",
    name: "Marian Minosa",
    tier: "executive",
    initials: "MM",
  },
  {
    key: "jocelynFernando",
    name: "Jocelyn Fermano",
    tier: "executive",
    initials: "JF",
  },
  {
    key: "aileenJoyEgot",
    name: "Aileen Joy Egot",
    tier: "executive",
    initials: "AE",
  },
  {
    key: "alexisPacapac",
    name: "Alexis Pacapac",
    tier: "executive",
    initials: "AP",
  },
];

/** @deprecated Use EXECUTIVE_TEAM — kept for any legacy imports */
export const TEAM_MEMBERS_BASE = EXECUTIVE_TEAM;
