import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
}

export interface StudentResponse {
  students: Student[];
  page: number;
  limit: number;
  search: string;
  totalStudents: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/students';

  getStudents(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<StudentResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<StudentResponse>(
      this.apiUrl,
      { params }
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(
      `${this.apiUrl}/${id}`
    );
  }

  createStudent(
    student: Omit<Student, 'id'>
  ): Observable<Student> {
    return this.http.post<Student>(
      this.apiUrl,
      student
    );
  }

  updateStudent(
    id: number,
    student: Omit<Student, 'id'>
  ): Observable<Student> {
    return this.http.put<Student>(
      `${this.apiUrl}/${id}`,
      student
    );
  }

  deleteStudent(
    id: number
  ): Observable<{
    message: string;
    student: Student;
  }> {
    return this.http.delete<{
      message: string;
      student: Student;
    }>(`${this.apiUrl}/${id}`);
  }
}