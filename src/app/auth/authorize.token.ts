import { HttpContextToken } from "@angular/common/http";

export const AUTHORIZE = new HttpContextToken<boolean>(() => false);