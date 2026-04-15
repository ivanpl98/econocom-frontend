import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterModalComponent } from './register-modal.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialogRef } from '@angular/material/dialog';

describe('RegisterModalComponent', () => {
  let component: RegisterModalComponent;
  let fixture: ComponentFixture<RegisterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: {} } // Proporcionamos un objeto vacío como mock
      ]
    });
    fixture = TestBed.createComponent(RegisterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
