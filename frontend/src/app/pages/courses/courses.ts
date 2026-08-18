import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Course, CourseService } from '../../services/course';

@Component({
  selector: 'app-courses',
  standalone: true,
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {

  private readonly courseService = inject(CourseService);

  // =========================
  // Reactive UI state
  // =========================

  courses = signal<Course[]>([]);

  page = signal(1);
  limit = signal(10);
  search = signal('');

  totalCourses = signal(0);
  totalPages = signal(0);

  loading = signal(false);
  error = signal('');


  // =========================
  // Component initialization
  // =========================

  ngOnInit(): void {
    this.loadCourses();
  }


  // =========================
  // Load courses
  // =========================

  loadCourses(): void {

    this.loading.set(true);
    this.error.set('');

    console.log('Loading courses...');

    this.courseService
      .getCourses(
        this.page(),
        this.limit(),
        this.search()
      )
      .pipe(
        finalize(() => {
          this.loading.set(false);

          console.log('Course request finished.');
        })
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Course API response:',
            response
          );

          this.courses.set(response.courses);

          this.page.set(response.page);

          this.limit.set(response.limit);

          this.search.set(response.search);

          this.totalCourses.set(
            response.totalCourses
          );

          this.totalPages.set(
            response.totalPages
          );
        },

        error: (error) => {

          console.error(
            'Course API error:',
            error
          );

          this.error.set(
            'Unable to load courses.'
          );
        }

      });
  }
}