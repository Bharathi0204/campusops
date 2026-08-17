import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Student, StudentService } from '../../services/student';

@Component({
  selector: 'app-student-detail',
  imports: [],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  student = signal<Student | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  constructor() {
    this.loadStudent();
  }

  loadStudent(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('Invalid student ID.');
      this.loading.set(false);
      return;
    }

    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        console.log('Student from API:', student);

        this.student.set(student);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load student:', error);

        this.errorMessage.set(
          'Student not found or unable to load student.'
        );

        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }
}