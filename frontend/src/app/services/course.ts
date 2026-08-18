import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export interface CourseListResponse {
  courses: Course[];
  page: number;
  limit: number;
  search: string;
  totalCourses: number;
  totalPages: number;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  credits: number;
}

export interface CourseResponse {
  message: string;
  course: Course;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/courses';

  getCourses(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<CourseListResponse> {

    return this.http.get<CourseListResponse>(
      this.apiUrl,
      {
        params: {
          page,
          limit,
          search
        }
      }
    );
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(
      `${this.apiUrl}/${id}`
    );
  }

  createCourse(
    course: CreateCourseRequest
  ): Observable<CourseResponse> {

    return this.http.post<CourseResponse>(
      this.apiUrl,
      course
    );
  }

  updateCourse(
    id: number,
    course: CreateCourseRequest
  ): Observable<CourseResponse> {

    return this.http.put<CourseResponse>(
      `${this.apiUrl}/${id}`,
      course
    );
  }

  deleteCourse(
    id: number
  ): Observable<CourseResponse> {

    return this.http.delete<CourseResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}