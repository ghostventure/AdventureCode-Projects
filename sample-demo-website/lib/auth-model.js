import { canRoleAccessPath } from "./route-access-policy";

export const authStates = [
  "checking-session",
  "signed-out",
  "client-session",
  "manager-session",
  "access-review"
];

export function getRouteForRole(role) {
  if (role === "client") return "/client";
  if (role === "manager") return "/manager";
  return "/auth";
}

export function canAccessRoute(role, route) {
  return canRoleAccessPath(role, route);
}
