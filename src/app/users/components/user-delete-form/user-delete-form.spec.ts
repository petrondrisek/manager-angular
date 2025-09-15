import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDeleteForm } from './user-delete-form';

describe('UserDeleteForm', () => {
  let component: UserDeleteForm;
  let fixture: ComponentFixture<UserDeleteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDeleteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDeleteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
