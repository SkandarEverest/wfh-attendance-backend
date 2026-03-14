type UserInfo = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  token?: string;
  modules: AllowedAccess[];
};
