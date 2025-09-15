import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public isModalOpen : WritableSignal<boolean> = signal(false)

  constructor() { }

  lockScroll(element: HTMLElement, on: boolean) {
    const scrollY = element.scrollTop || window.scrollY;
    const scrollX = element.scrollLeft || window.scrollX;


    if (on) {
      element.classList.add('lock-scroll');
      element.style.top = `${-scrollY}px`;
      element.style.left = `${-scrollX}px`;

      // Save scroll position
      element.dataset['scrollY'] = scrollY.toString();
      element.dataset['scrollX'] = scrollX.toString();
    } else {
      element.classList.remove('lock-scroll');
      element.style.top = '';
      element.style.left = '';
    
      // return back scroll position and delete saved
      const left = parseInt(element.dataset['scrollX'] ?? '0');
      const top = parseInt(element.dataset['scrollY'] ?? '0');

      element.scrollTop 
         ? element.scrollTo({left, top}) 
         : window.scroll(left, top);

      delete element.dataset['scrollY'];
      delete element.dataset['scrollX'];
    }
  }
}
