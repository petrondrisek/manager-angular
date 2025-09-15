import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionEditForm } from './mission-edit-form';

describe('MissionAddForm', () => {
  let component: MissionEditForm;
  let fixture: ComponentFixture<MissionEditForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionEditForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionEditForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
