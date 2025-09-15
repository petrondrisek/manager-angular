import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { APP_NAME } from './app.config';
import { ModalService } from './shared/modal/services/modal-service';
import { Theme } from './shared/theme/components/theme';
import { Nav } from './shared/nav/components/nav';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './shared/http/interceptors/error-interceptor';
import { Notify } from './shared/notify/components/notify/notify';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, RouterLink, Theme, Notify],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class App {
  private readonly modalService = inject(ModalService);

  protected title: string = APP_NAME;

  constructor() {
    effect(() => {
      const body = document.querySelector('body')!;

      const isModalOpen = this.modalService.isModalOpen();
      this.modalService.lockScroll(body, isModalOpen);
    });
 
  }

}
