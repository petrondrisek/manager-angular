import { User } from "../auth/auth.types"

export type Mission = {
    id: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deadline?: Date,
    isCompleted: boolean,
    user: User,
    userId: string,
    createdBy: User,
    createdById: string,
    relatedUsers: User[],
    tags: string[],
    files: string[],
    messages: MissionChat[],
    lastChatMessageAt: Date|null
}

export type MissionChat = {
    id: string,
    message: string,
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    user: User,
    missionId: string
}

export interface CreateMissionDto {
    title: string;
    description: string|null;
    deadline: Date|null;
    userId: string|null;
    relatedUserIds: string[];
    files: FileList|File[];
    tags: string[]|null;
}

export interface UpdateMissionDto {
    id: string;
    title: string;
    description: string|null;
    deadline: Date|null;
    userId: string|null;
    relatedUserIds: string[];
    storedFiles: string[];
    files: FileList|File[];
    tags: string[]|null;
}


export interface MissionDetailResponse {
    mission: Mission,
    chat: MissionChat[]
}

export type MissionLastVisit = {
    missionId: string,
    lastVisit: Date
}

export interface UserMissionResponse {
    items: Mission[];
    totalCount: number;
    lastVisits: string[];
}