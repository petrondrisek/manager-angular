import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chat } from './chat';

describe('Chat', () => {
  let component: Chat;
  let fixture: ComponentFixture<Chat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect touch device', () => {
    // Mock touch device
    Object.defineProperty(window, 'ontouchstart', {
      value: true,
      writable: true
    });
    
    expect(component.isTouchDevice()).toBeTruthy();
  });

  it('should auto resize textarea', () => {
    const mockTextarea = {
      style: { height: '' },
      scrollHeight: 100
    } as any;
    
    const event = { target: mockTextarea } as Event;
    component.autoResize(event);
    
    expect(mockTextarea.style.height).toBe('100px');
  });

  it('should handle Enter key for sending message', () => {
    spyOn(component, 'sendMessage');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    
    component.onKeyDown(event);
    
    expect(component.sendMessage).toHaveBeenCalled();
  });

  it('should not send message on Shift+Enter', () => {
    spyOn(component, 'sendMessage');
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    
    component.onKeyDown(event);
    
    expect(component.sendMessage).not.toHaveBeenCalled();
  });

  it('should set and clear hovered message', () => {
    component.setHoveredMessage('message-1');
    expect(component.hoveredMessage()).toBe('message-1');
    
    component.setHoveredMessage(null);
    expect(component.hoveredMessage()).toBeNull();
  });
});