import { HttpClient, HttpContext } from "@angular/common/http";
import { AUTHORIZE } from "../../../auth/authorize.token";
import { Injectable } from "@angular/core";
import { BACKEND_URL } from "../../../app.config";
import { Observable } from "rxjs";
import { HttpMethodTypes, UserHttpReqOptions } from "../types/api";

@Injectable({providedIn: 'root'})
export class HttpRequestService
{
  constructor(private readonly http: HttpClient) {}

  httpReq<T>(
    method: HttpMethodTypes, 
    url: string, 
    body?: object, 
    authorized: boolean = false
  ) : Observable<T> {
      const options: UserHttpReqOptions = { 
        context: new HttpContext().set(AUTHORIZE, authorized),
        observe: 'body',
        responseType: 'json'
      };

      if(body && method !== 'get') options.body = body;

      return this.http.request<T>(method, BACKEND_URL + url, options);
    }
}
