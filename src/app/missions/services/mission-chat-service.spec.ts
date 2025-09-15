import { TestBed } from '@angular/core/testing';

import { MissionChatService } from './mission-chat-service';

describe('MissionChatService', () => {
  let service: MissionChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
