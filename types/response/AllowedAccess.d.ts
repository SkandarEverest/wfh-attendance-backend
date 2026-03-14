type AllowedAccess = {
  moduleId: number;
  moduleName: string;
  ability: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
};
