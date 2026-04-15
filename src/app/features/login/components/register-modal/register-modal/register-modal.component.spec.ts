import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { RegisterModalComponent } from './register-modal.component';

describe('RegisterModalComponent', () => {
  let component: RegisterModalComponent;
  let fixture: ComponentFixture<RegisterModalComponent>;
  
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegisterModalComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [RegisterModalComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with NO data when onCancel is called', () => {
    component.onCancel();
    // Comprobamos que llamó al método close del MatDialog vacío
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should NOT close dialog on submit if form is invalid', () => {
    component.onSubmit();
    // Como el formulario arranca vacío e inválido, no debe cerrarse
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog with form data on valid submit', () => {
    // Llenamos el formulario
    component.registerForm.get('email')?.setValue('nuevo@econocom.com');
    component.registerForm.get('password')?.setValue('secreta123');

    component.onSubmit();

    // Debe cerrarse enviando los datos introducidos
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      email: 'nuevo@econocom.com',
      password: 'secreta123'
    });
  });
});