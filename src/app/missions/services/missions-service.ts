import { inject, Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/http/services/http-request-service';
import { Observable } from 'rxjs';
import { CreateMissionDto, Mission, MissionDetailResponse, UpdateMissionDto, UserMissionResponse } from '../missions.types';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MissionsService {
  private readonly httpRequestService = inject(HttpRequestService);

  getMissionsByUser(offset: number = 0, limit: number = 5, filterTag: string|null = null, completed: boolean = false): Observable<UserMissionResponse> {
    return this.httpRequestService.httpReq('get', `/api/mission/list/?${filterTag !== null ? `filterTag=${filterTag}&` : ''}offset=${offset}&limit=${limit}&completed=${completed}`, {}, true);
  }

  getMission(id: string, offset: number = 0, limit: number = 10): Observable<MissionDetailResponse> {
    console.log(`/api/mission/detail/${id}?offset=${offset}&limit=${limit}`);
    return this.httpRequestService.httpReq('get', `/api/mission/detail/${id}?offset=${offset}&limit=${limit}`, {}, true);
  }

  createMission(missionDto: CreateMissionDto): Observable<Mission> {
    let formData = new FormData();
    formData = this.parseDtoToFormData(formData, missionDto);

    return this.httpRequestService.httpReq('post', '/api/mission/create', formData, true);
  }

  updateMission(missionDto: UpdateMissionDto): Observable<Mission> {
    let formData = new FormData();
    formData = this.parseDtoToFormData(formData, missionDto);

    return this.httpRequestService.httpReq('patch', '/api/mission/update', formData, true);
  }

  completeMission(id: string): Observable<Mission> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('isCompleted', 'true');

    return this.httpRequestService.httpReq('patch', '/api/mission/update', formData, true);
  }

  unCompleteMission(id: string): Observable<Mission> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('isCompleted', 'false');

    return this.httpRequestService.httpReq('patch', '/api/mission/update', formData, true);
  }

  updateLastVisit(id: string): Observable<Mission> {
    return this.httpRequestService.httpReq('patch', `/api/mission/update/last-visit/${id}`, {}, true);
  }

  deadlineValidator: ValidatorFn = (control: AbstractControl) => {
    const deadline = control.value;
    const today = new Date();

    if (deadline && deadline < today) {
      return { deadlineInvalid: true };
    }
    return null;
  }

  private parseDtoToFormData(formData: FormData, dto: object): FormData {
    Object.entries(dto).forEach(([key, value]) => {
      if (value == null) return;
      
      if (key === 'files' && (value instanceof FileList || Array.isArray(value))) {
        Array.from(value).forEach((file, index) => {
          formData.append('files', file);
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, String(item)));
      } else {
        formData.append(key, String(value));
      }
    });

    return formData;
  }
}
