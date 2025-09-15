export interface User {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    isActive: boolean;
    permissions: Array<Permission>;
 };

 export enum Permission {
    User = 0,
    ManageUsers = 1,
    CreateTask = 2,
    ModerateChat = 3,
    ModerateTasks = 4
 };

 export interface UserLoggedIn {
    token: string;
    refreshToken: string;
    refreshTokenValidHours: number;
    isPasswordSet: boolean;
 };

 