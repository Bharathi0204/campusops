import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(
        (m) => m.Dashboard
      ),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./pages/students/students').then(
        (m) => m.Students
      ),
  },
  {
  path: 'students/new',
  loadComponent: () =>
    import('./pages/student-form/student-form').then(
      (m) => m.StudentForm
    ),
},
{
  path: 'students/edit/:id',
  loadComponent: () =>
    import('./pages/student-form/student-form').then(
      (m) => m.StudentForm
    ),
},
  {
    path: 'students/:id',
    loadComponent: () =>
      import('./pages/student-detail/student-detail').then(
        (m) => m.StudentDetail
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];