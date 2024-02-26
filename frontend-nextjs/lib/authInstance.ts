import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type AuthModule = {
  setToken: (value: string) => void;
  get: <T>(
    url: string,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
};

export const AuthModule = (): AuthModule => {
  let token = "";

  const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_SERVER_URL}`,
  });

  // @ts-ignore
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    return applyAuthToken(config);
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        console.log("Received a 401 response");
        return Promise.resolve({
          data: null,
          status: 401,
          statusText: "Try again",
          headers: error.response.headers,
          config: error.config,
        });
      }
      return Promise.reject(error);
    }
  );

  const setToken = (value: string): void => {
    token = value;
  };

  const applyAuthToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
    config.headers = {
      "Content-Type": "application/json",
      withCredentials: true,
      ...config.headers,
    };
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  };

  const get = <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config || {});
  };

  const post = <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config || {});
  };

  const put = <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config || {});
  };

  return { setToken, get, post, put };
};

export const authInstance = AuthModule();
