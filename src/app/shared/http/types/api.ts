import { HttpContext, HttpHeaders } from "@angular/common/http";

export type HttpMethodTypes = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface UserHttpReqOptions
{
  context: HttpContext,
  observe: 'body',
  body?: object,
  responseType: 'json'
}