import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionAddForm } from './mission-add-form';

describe('MissionAddForm', () => {
  let component: MissionAddForm;
  let fixture: ComponentFixture<MissionAddForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionAddForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionAddForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
