import axiosClient from './axiosClient';
import { API_NAMES } from './apiNames';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; password: string };

export async function login(payload: LoginPayload) {
    return axiosClient.post(API_NAMES.users.login, payload);
}

export async function register(payload: RegisterPayload) {
    return axiosClient.post(API_NAMES.users.register, payload);
}

export async function me() {
    return axiosClient.get(API_NAMES.users.me);
}

export default { login, register, me };
