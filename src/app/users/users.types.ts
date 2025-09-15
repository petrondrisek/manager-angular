import { User } from "../auth/auth.types";


export interface CreateUserDto {
    username: string;
    email: string;
}

export interface UpdateUserDto {
    firstName: string | null;
    lastName: string | null;
    email: string;
    resetPassword: boolean;
    permissions: number[];
}

export interface UsersResponseProps {
    items: User[];
    totalCount: number;
}