import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { NotifyService } from "../../notify/services/notify";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private readonly router: Router,
        private readonly notifyService: NotifyService
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 400) {
                    this.notifyService.addNotification({ type: 'error', message: 'Bad request' });
                }
                
                if (error.status === 401) {
                    this.notifyService.addNotification({ type: 'error', message: 'Unauthorized' });
                    this.router.navigate(['/login']);
                }
                
                if (error.status === 403) {
                    this.notifyService.addNotification({ type: 'error', message: 'Forbidden' });
                }

                if (error.status === 404) {
                    this.notifyService.addNotification({ type: 'error', message: 'Not found' });
                }

                return throwError(() => error);
            })
        );
    }
}
