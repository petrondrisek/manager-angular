import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from '../../cookies/services/cookie-service';
import { COOKIE_AUTH_TOKEN } from '../../../auth/auth.const';
import { HttpRequestService } from '../../http/services/http-request-service';
import { BACKEND_URL } from '../../../app.config';

export interface FileInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  createdDate: string;
  modifiedDate: string;
  extension: string;
  contentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private readonly httpService = inject(HttpRequestService);
  private readonly cookieService = inject(CookieService);

  getFileInfo(fileName: string): Observable<FileInfo> {
    return this.httpService.httpReq<FileInfo>('get', `/api/file/info/${encodeURIComponent(fileName)}`, undefined, true);
  }

  downloadFile(fileName: string): Observable<void> {
    return new Observable(observer => {
      const downloadUrl = `${this.getBackendUrl()}/api/file/${encodeURIComponent(fileName)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      observer.next();
      observer.complete();
    });
  }

  downloadFileAsBlob(fileName: string): Observable<Blob> {
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.getBackendUrl()}/api/file/${encodeURIComponent(fileName)}`, true);
      xhr.responseType = 'blob';
      
      const token = this.cookieService.getCookie(COOKIE_AUTH_TOKEN);
      if(!token) return observer.error(new Error('Unauthorized'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          observer.next(xhr.response);
          observer.complete();
        } else {
          observer.error(new Error(`HTTP Error: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        observer.error(new Error('Network error'));
      };
      
      xhr.send();
    });
  }

  downloadFileWithProgress(fileName: string): Observable<{progress: number, file?: Blob}> {
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.getBackendUrl()}/api/file/stream/${encodeURIComponent(fileName)}`, true);
      xhr.responseType = 'blob';

      const token = this.cookieService.getCookie(COOKIE_AUTH_TOKEN);
      if(!token) return observer.error(new Error('Unauthorized'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress });
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          observer.next({ progress: 100, file: xhr.response });
          observer.complete();
        } else {
          observer.error(new Error(`HTTP Error: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        observer.error(new Error('Network error'));
      };
      
      xhr.send();
    });
  }

  private getBackendUrl(): string {
    return BACKEND_URL;
  }
}