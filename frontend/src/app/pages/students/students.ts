import { Component, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { Student, StudentService } from '../../services/student';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';

@Component({
  selector: 'app-students',
  imports: [RouterLink],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  private readonly studentService =
    inject(StudentService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly searchSubject =
    new Subject<string>();

  // -----------------------------
  // STUDENT DATA
  // -----------------------------

  students = signal<Student[]>([]);

  loading = signal(true);

  errorMessage = signal('');

  // -----------------------------
  // SUCCESS NOTIFICATION
  // -----------------------------

  successMessage = signal('');

  successType = signal<
    'create' | 'update' | 'delete' | ''
  >('');

  // -----------------------------
  // SEARCH
  // -----------------------------

  searchTerm = signal('');

  // -----------------------------
  // PAGINATION
  // -----------------------------

  currentPage = signal(1);

  limit = 10;

  totalStudents = signal(0);

  totalPages = signal(0);

  // -----------------------------
  // DELETE STATE
  // -----------------------------

  showDeleteModal = signal(false);

  selectedStudent =
    signal<Student | null>(null);

  deleting = signal(false);

  // -----------------------------
  // CONSTRUCTOR
  // -----------------------------

  constructor() {
    /*
     * Handle success messages coming
     * from Create and Update pages.
     */
    this.route.queryParamMap.subscribe(
      (params) => {
        const created =
          params.get('created');

        const updated =
          params.get('updated');

        if (created === 'true') {
          this.showSuccessMessage(
            'Student created successfully!',
            'create'
          );
        }

        if (updated === 'true') {
          this.showSuccessMessage(
            'Student details updated successfully!',
            'update'
          );
        }
      }
    );

    // Initial student loading
    this.loadStudents();

    // Search with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.searchTerm.set(searchTerm);

        this.currentPage.set(1);

        this.loadStudents();
      });
  }

  // -----------------------------
  // SUCCESS MESSAGE
  // -----------------------------

  private showSuccessMessage(
    message: string,
    type:
      | 'create'
      | 'update'
      | 'delete'
  ): void {
    // Set message
    this.successMessage.set(message);

    // Set notification type
    this.successType.set(type);

    /*
     * Remove query parameters from the URL.
     *
     * Example:
     *
     * /students?updated=true
     *
     * becomes:
     *
     * /students
     *
     * This prevents the success message
     * from appearing again after refresh.
     */
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });

    // Automatically hide notification
    setTimeout(() => {
      this.successMessage.set('');
      this.successType.set('');
    }, 4000);
  }

  // -----------------------------
  // LOAD STUDENTS
  // -----------------------------

  loadStudents(): void {
    this.loading.set(true);

    this.errorMessage.set('');

    this.studentService
      .getStudents(
        this.currentPage(),
        this.limit,
        this.searchTerm()
      )
      .subscribe({
        next: (response) => {
          this.students.set(
            response.students
          );

          this.totalStudents.set(
            response.totalStudents
          );

          this.totalPages.set(
            response.totalPages
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Failed to load students:',
            error
          );

          this.errorMessage.set(
            'Unable to load students. Please try again.'
          );

          this.loading.set(false);
        },
      });
  }

  // -----------------------------
  // SEARCH
  // -----------------------------

  searchStudents(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchSubject.next(
      input.value
    );
  }

  clearSearch(): void {
    this.searchTerm.set('');

    this.currentPage.set(1);

    this.loadStudents();
  }

  // -----------------------------
  // PAGINATION
  // -----------------------------

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.currentPage()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadStudents();
  }

  previousPage(): void {
    this.goToPage(
      this.currentPage() - 1
    );
  }

  nextPage(): void {
    this.goToPage(
      this.currentPage() + 1
    );
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.totalPages(),
      },
      (_, index) => index + 1
    );
  }

  // -----------------------------
  // DELETE MODAL
  // -----------------------------

  openDeleteModal(
    student: Student
  ): void {
    this.selectedStudent.set(student);

    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    /*
     * Do not allow the modal to close
     * while deletion is in progress.
     */
    if (this.deleting()) {
      return;
    }

    this.showDeleteModal.set(false);

    this.selectedStudent.set(null);
  }

  // -----------------------------
  // CONFIRM DELETE
  // -----------------------------

  confirmDelete(): void {
    const student =
      this.selectedStudent();

    // Safety check
    if (!student) {
      return;
    }

    // Start deleting state
    this.deleting.set(true);

    this.studentService
      .deleteStudent(student.id)
      .subscribe({
        next: (response) => {
          console.log(
            'Student deleted successfully:',
            response
          );

          // Stop deleting state
          this.deleting.set(false);

          // Close modal
          this.showDeleteModal.set(false);

          this.selectedStudent.set(null);

          /*
           * If we deleted the only student
           * on the current page, move back
           * one page when possible.
           */
          if (
            this.students().length === 1 &&
            this.currentPage() > 1
          ) {
            this.currentPage.update(
              (page) => page - 1
            );
          }

          // Refresh student list
          this.loadStudents();

          // Show delete notification
          this.showSuccessMessage(
            `${student.name} deleted successfully!`,
            'delete'
          );
        },

        error: (error) => {
          console.error(
            'Failed to delete student:',
            error
          );

          // Always unlock delete button
          this.deleting.set(false);

          /*
           * Keep modal open so the user
           * knows deletion did not happen.
           */
          this.errorMessage.set(
            'Unable to delete student. Please try again.'
          );
        },
      });
  }
}