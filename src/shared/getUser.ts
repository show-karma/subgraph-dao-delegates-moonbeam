import {  User } from "../../generated/schema";

export function getUser(id: string): User {
  return (User.load(id) || new User(id)) as User;
}
