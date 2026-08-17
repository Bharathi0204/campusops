import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StudentService } from '../../services/student';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentForm {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // -----------------------------
  // UI STATE
  // -----------------------------

  submitting = signal(false);
  loadingStudent = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  // -----------------------------
  // EDIT MODE
  // -----------------------------

  isEditMode = signal(false);
  studentId = signal<number | null>(null);

  // -----------------------------
  // FORM
  // -----------------------------

  studentForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],

    age: [
      18,
      [
        Validators.required,
        Validators.min(18),
        Validators.max(120),
      ],
    ],
  });

  constructor() {
    this.checkEditMode();
  }

  // -----------------------------
  // CHECK CREATE / EDIT MODE
  // -----------------------------

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      // CREATE MODE
      this.isEditMode.set(false);
      return;
    }

    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      this.errorMessage.set('Invalid student ID.');
      return;
    }

    // EDIT MODE
    this.isEditMode.set(true);
    this.studentId.set(numericId);

    this.loadStudent(numericId);
  }

  // -----------------------------
  // LOAD STUDENT
  // -----------------------------

  private loadStudent(id: number): void {
    this.loadingStudent.set(true);
    this.errorMessage.set('');

    this.studentService
      .getStudentById(id)
      .pipe(
        finalize(() => {
          this.loadingStudent.set(false);
        })
      )
      .subscribe({
        next: (student) => {
          this.studentForm.patchValue({
            name: student.name,
            email: student.email,
            age: student.age,
          });
        },

        error: (error) => {
          console.error(
            'Failed to load student:',
            error
          );

          if (error.status === 404) {
            this.errorMessage.set(
              'Student not found.'
            );
          } else {
            this.errorMessage.set(
              'Unable to load student. Please try again.'
            );
          }
        },
      });
  }

  // -----------------------------
  // FORM CONTROLS
  // -----------------------------

  get name() {
    return this.studentForm.controls.name;
  }

  get email() {
    return this.studentForm.controls.email;
  }

  get age() {
    return this.studentForm.controls.age;
  }

  // -----------------------------
  // SUBMIT
  // -----------------------------

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    if (
      this.submitting() ||
      this.loadingStudent()
    ) {
      return;
    }

    this.submitting.set(true);

    const studentData =
      this.studentForm.getRawValue();

    // -----------------------------
    // CREATE
    // -----------------------------

    if (!this.isEditMode()) {
      this.createStudent(studentData);
      return;
    }

    // -----------------------------
    // UPDATE
    // -----------------------------

    const id = this.studentId();

    if (id === null) {
      this.submitting.set(false);
      this.errorMessage.set(
        'Invalid student ID.'
      );
      return;
    }

    this.updateStudent(id, studentData);
  }

  // -----------------------------
  // CREATE STUDENT
  // -----------------------------

  private createStudent(
    studentData: {
      name: string;
      email: string;
      age: number;
    }
  ): void {
    this.studentService
      .createStudent(studentData)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        })
      )
      .subscribe({
        next: (student) => {
          console.log(
            'Student created successfully:',
            student
          );

          this.router.navigate(
            ['/students'],
            {
              queryParams: {
                created: 'true',
              },
            }
          );
        },

        error: (error) => {
          this.handleSubmitError(error);
        },
      });
  }

  // -----------------------------
  // UPDATE STUDENT
  // -----------------------------

  private updateStudent(
    id: number,
    studentData: {
      name: string;
      email: string;
      age: number;
    }
  ): void {
    this.studentService
      .updateStudent(id, studentData)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        })
      )
      .subscribe({
        next: (student) => {
          console.log(
            'Student updated successfully:',
            student
          );

          this.router.navigate(
            ['/students'],
            {
              queryParams: {
                updated: 'true',
              },
            }
          );
        },

        error: (error) => {
          this.handleSubmitError(error);
        },
      });
  }

  // -----------------------------
  // HANDLE CREATE / UPDATE ERRORS
  // -----------------------------

  private handleSubmitError(
    error: any
  ): void {
    console.log(
      'Student form response:',
      error
    );

    if (error.status === 409) {
      this.errorMessage.set(
        error.error?.message ??
        'Email already exists.'
      );

      return;
    }

    if (error.status === 400) {
      this.errorMessage.set(
        error.error?.message ??
        'Please check the student information.'
      );

      return;
    }

    if (error.status === 404) {
      this.errorMessage.set(
        'Student not found.'
      );

      return;
    }

    this.errorMessage.set(
      'Unable to save student. Please try again.'
    );
  }

  // -----------------------------
  // CANCEL
  // -----------------------------

  cancel(): void {
    if (this.submitting()) {
      return;
    }

    this.router.navigate([
      '/students',
    ]);
  }
}