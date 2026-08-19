import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';

import { Course, CourseService } from '../../services/course';

@Component({
  selector: 'app-courses',
  standalone: true,
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {

  private readonly courseService = inject(CourseService);

  // ============================================
  // Course data
  // ============================================

  courses = signal<Course[]>([]);


  // ============================================
  // Pagination state
  // ============================================

  page = signal(1);

  limit = signal(10);

  totalCourses = signal(0);

  totalPages = signal(0);


  // ============================================
  // Search state
  // ============================================

  search = signal('');

  private readonly searchSubject =
    new Subject<string>();


  // ============================================
  // UI state
  // ============================================

  loading = signal(false);

  error = signal('');


  // ============================================
  // Component initialization
  // ============================================

  ngOnInit(): void {

    this.setupSearch();

    this.loadCourses();
  }


  // ============================================
  // Setup debounced search
  // ============================================

  private setupSearch(): void {

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((searchValue) => {

        this.search.set(searchValue);

        // New search always starts from page 1
        this.page.set(1);

        this.loadCourses();

      });
  }


  // ============================================
  // Search input
  // ============================================

  onSearch(value: string): void {

    this.searchSubject.next(value.trim());

  }


  // ============================================
  // Clear search
  // ============================================

  clearSearch(): void {

    this.search.set('');

    this.page.set(1);

    this.loadCourses();

  }


  // ============================================
  // Load courses from backend
  // ============================================

  loadCourses(): void {

    this.loading.set(true);

    this.error.set('');


    console.log(
      'Loading courses:',
      {
        page: this.page(),
        limit: this.limit(),
        search: this.search()
      }
    );


    this.courseService
      .getCourses(
        this.page(),
        this.limit(),
        this.search()
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Course API response:',
            response
          );


          this.courses.set(
            response.courses
          );

          this.page.set(
            response.page
          );

          this.limit.set(
            response.limit
          );

          this.search.set(
            response.search
          );

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

        },


        complete: () => {

          this.loading.set(false);

          console.log(
            'Course request finished.'
          );

        }

      });

  }


  // ============================================
  // Go to previous page
  // ============================================

  previousPage(): void {

    if (this.page() <= 1) {
      return;
    }

    this.page.update(
      currentPage => currentPage - 1
    );

    this.loadCourses();

  }


  // ============================================
  // Go to next page
  // ============================================

  nextPage(): void {

    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.update(
      currentPage => currentPage + 1
    );

    this.loadCourses();

  }

}