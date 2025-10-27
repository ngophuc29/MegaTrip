/** @format */

import axios from 'axios';
import queryString from 'query-string';

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7700',
    paramsSerializer: (params) => queryString.stringify(params),
    timeout: 15000,
});

axiosClient.interceptors.request.use((config: any) => {
    const accesstoken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    config.headers = {
        Authorization: accesstoken ? `Bearer ${accesstoken}` : '',
        Accept: 'application/json',
        ...config.headers,
    };
    config.data = config.data ? config.data : {};
    return config;
});

axiosClient.interceptors.response.use(
    (res) => {
        if (res.data && res.status >= 200 && res.status < 300) {
            return res.data.data ?? res.data; // some APIs wrap in { data }
        }
        return Promise.reject({ message: res.data?.message || 'Unknown error', status: res.status, data: res.data });
    },
    (error) => {
        const { response } = error;
        const errObj = {
            message: response?.data?.message || error.message || 'Unknown error',
            status: response?.status,
            data: response?.data,
        };
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('API Error:', errObj);
        }
        return Promise.reject(errObj);
    }
);

export default axiosClient;
