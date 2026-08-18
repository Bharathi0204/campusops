import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  totalStudents = signal(0);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loading.set(true);
    this.error.set('');

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.totalStudents.set(stats.totalStudents);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Dashboard statistics error:', error);

        this.error.set('Unable to load dashboard statistics.');
        this.loading.set(false);
      }
    });
  }

  goToStudents(): void {
    this.router.navigate(['/students']);
  }

  addStudent(): void {
    this.router.navigate(['/students/new']);
  }
}