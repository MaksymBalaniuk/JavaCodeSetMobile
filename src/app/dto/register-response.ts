export interface RegisterResponse {
  existsByUsername: boolean;
  existsByEmail: boolean;
  token: string;
  id: string;
}
