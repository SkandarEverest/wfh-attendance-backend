type ServiceResponse<Data = any> = {
  size?: number;
  total?: number;
  page?: number;
  data?: Data;
  status: number;
  message: string;
};
