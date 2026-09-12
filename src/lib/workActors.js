export const OWN_TEAM_ID = "obra-geral";
export const OWN_TEAM_NAME = "Equipe propria / obra geral";

export function isOwnTeam(id) {
  return id === OWN_TEAM_ID || id === "temp";
}
