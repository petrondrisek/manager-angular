import { inject, Injectable } from '@angular/core';
import { UsersResponseProps, CreateUserDto, UpdateUserDto } from '../users.types';
import { HttpRequestService } from '../../shared/http/services/http-request-service';
import { User } from '../../auth/auth.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly httpRequestService = inject(HttpRequestService)

  getUsers(offset: number = 0, limit: number = 10, search: string = ''): Observable<UsersResponseProps> {
    return this.httpRequestService.httpReq<UsersResponseProps>(
      'get', 
      `/api/user/get?offset=${offset}&limit=${limit}&search=${search}`,
      {},
      true
    );
  }
  createUser(userDto: CreateUserDto): Observable<User> {
    return this.httpRequestService.httpReq<User>(
      'post', 
      '/api/user/register', 
      userDto, 
      true
    );
  }

  updateUser(id: string, userDto: UpdateUserDto): Observable<User> {
    return this.httpRequestService.httpReq<User>(
      'patch', 
      `/api/user/update/${id}`, 
      userDto, 
      true
    );
  }

  deleteUser(id: string): Observable<{ success: boolean }> {
    return this.httpRequestService.httpReq<{ success: boolean }>(
      'delete', 
      `/api/user/delete/${id}`, 
      {}, 
      true
    );
  }
}
