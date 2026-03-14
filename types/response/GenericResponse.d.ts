type GenericResponse<Data = any> = {
  success: boolean;
  message: string;
  status: number;
  total?: number;
  size?: number;
  page?: number;
  data?: Data;
};
