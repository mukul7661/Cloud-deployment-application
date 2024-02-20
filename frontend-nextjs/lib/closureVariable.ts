import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
// import RefreshTokenApi from "./refreshTokenApi";

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
  let authOrigins: string[] = ["http://localhost:8080"];

  const axiosInstance = axios.create({
    baseURL: `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000`,
  });
  // @ts-ignore
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    return applyAuthToken(config);
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Do something with the 401 response
        console.log("Received a 401 response");
        // await RefreshTokenApi();
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
    // const destOrigin = new URL(config.url!).origin;
    // const destOrigin = "http://localhost:9000";

    // if (authOrigins.includes(destOrigin)) {
    config.headers = {
      // "Access-Control-Allow-Credentials": true,
      // "Content-Type": "application/json",
      // ...config.headers,
      withCredentials: true,
    };
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    // }

    console.log(config.headers, "config");

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
