import {UserEntity} from "./user-entity";

export interface UserDetails {
  user: UserEntity | null;
  token: string;
}
