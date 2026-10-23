export function getGroups(claims: Record<string, any> | undefined): string[] {
  const raw = claims?.["cognito:groups"];
  if (typeof raw !== "string" || raw === "") return [];
  return raw.split(",");
}

export function isInGroup(claims: Record<string, any> | undefined, group: string): boolean {
  return getGroups(claims).includes(group);
}