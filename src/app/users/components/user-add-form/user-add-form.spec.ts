import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddForm } from './user-add-form';

describe('UserForm', () => {
  let component: UserAddForm;
  let fixture: ComponentFixture<UserAddForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAddForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
