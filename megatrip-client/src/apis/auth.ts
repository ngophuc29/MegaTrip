import axiosClient from './axiosClient';
import { API_NAMES } from './apiNames';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; password: string };
type VerifyOtpPayload = { email: string; code: string };
type ResendOtpPayload = { email: string };

export async function login(payload: LoginPayload) {
    return axiosClient.post(API_NAMES.users.login, payload);
}

export async function register(payload: RegisterPayload) {
    return axiosClient.post(API_NAMES.users.register, payload);
}

export async function verifyOtp(payload: VerifyOtpPayload) {
    return axiosClient.post(API_NAMES.auth.verifyOtp, payload);
}

export async function resendOtp(payload: ResendOtpPayload) {
    return axiosClient.post(API_NAMES.auth.resendOtp, payload);
}

export async function me() {
    return axiosClient.get(API_NAMES.users.me);
}

export default { login, register, verifyOtp, resendOtp, me };
