import { Organization } from "../../generated/schema";

export function getOrganization(id: string): Organization {
  return (Organization.load(id) || new Organization(id)) as Organization;
}
