import {UserStatus} from "../enumeration/user-status";
import {UserPremium} from "../enumeration/user-premium";

export interface UserEntity {
  id: string;
  username: string;
  password: string | null;
  email: string | null;
  status: UserStatus;
  premium: UserPremium;
  created: number;
  updated: number;
}
