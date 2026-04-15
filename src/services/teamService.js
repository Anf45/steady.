export const TEAM_OPTIONS = [
  {
    id: "earth",
    title: "Earth",
    icon: "🪨",
    description: "Grounded, steady, and consistent.",
    accentClass: "team-earth",
  },
  {
    id: "fire",
    title: "Fire",
    icon: "🔥",
    description: "Bold, intense, and energetic.",
    accentClass: "team-fire",
  },
  {
    id: "ice",
    title: "Ice",
    icon: "🧊",
    description: "Calm, clear, and focused.",
    accentClass: "team-ice",
  },
  {
    id: "air",
    title: "Air",
    icon: "💨",
    description: "Light, flexible, and adaptable.",
    accentClass: "team-air",
  },
];

export function getDefaultTeam() {
  return TEAM_OPTIONS[0].id;
}

export function getTeamDetails(teamId) {
  return TEAM_OPTIONS.find((team) => team.id === teamId) || TEAM_OPTIONS[0];
}
