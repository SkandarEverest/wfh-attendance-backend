type UserInfo = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  isSpecial: boolean;
  token?: string;
  modules: AllowedAccess[];
};
