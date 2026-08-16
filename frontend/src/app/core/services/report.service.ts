import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

export interface GeneratedReport {
  id: string;
  name: string;
  type: 'income_statement' | 'tax_summary' | 'budget_performance';
  period: string; // 'current_month' | 'last_month' | 'q1' | 'q2' | 'q3' | 'q4' | 'current_year'
  periodLabel: string; // e.g. "August 2026", "Q2 2026"
  format: 'PDF' | 'CSV';
  generatedDate: string; // e.g. "Aug 7, 2026, 5:00 PM"
  data: any; // The detailed report data payload
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;
  private reportsSubject = new BehaviorSubject<GeneratedReport[]>([]);
  public reports$ = this.reportsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load reports when user logs in, clear when logged out
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadReportsFromBackend();
      } else {
        this.reportsSubject.next([]);
      }
    });
  }

  private mapReport(r: any): GeneratedReport {
    const timestamp = r.createdAt ? new Date(r.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : '';

    return {
      id: r._id || r.id,
      name: r.reportName || r.name,
      type: r.reportType || r.type,
      period: r.period || r.periodLabel,
      periodLabel: r.period || r.periodLabel,
      format: r.format,
      generatedDate: timestamp || r.generatedDate,
      data: r.data
    };
  }

  private loadReportsFromBackend(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped = res.data.map((r: any) => this.mapReport(r));
          this.reportsSubject.next(mapped);
        }
      },
      error: (err) => {
        console.error('Failed to load reports from backend:', err);
      }
    });
  }

  getReports(): GeneratedReport[] {
    return this.reportsSubject.value;
  }

  deleteReport(id: string): void {
    this.http.delete<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          const current = this.getReports();
          const updated = current.filter(r => r.id !== id);
          this.reportsSubject.next(updated);
        }
      },
      error: (err) => {
        console.error('Failed to delete report:', err);
      }
    });
  }

  // Generates the report by calling backend API
  generateReport(
    type: 'income_statement' | 'tax_summary' | 'budget_performance',
    period: string,
    format: 'PDF' | 'CSV',
    targetYear: number = 2026
  ): Observable<GeneratedReport> {
    return this.http.post<any>(this.apiUrl, {
      reportType: type,
      period,
      format,
      year: targetYear
    }).pipe(
      map(res => {
        if (res.success && res.data) {
          const newReport = this.mapReport(res.data);
          const current = this.getReports();
          this.reportsSubject.next([newReport, ...current]);
          return newReport;
        }
        throw new Error(res.message || 'Failed to generate report from backend.');
      })
    );
  }

  downloadReportCSV(report: GeneratedReport): void {
    this.downloadReportFile(report);
  }

  downloadReportPDF(report: GeneratedReport): void {
    this.downloadReportFile(report);
  }

  private downloadReportFile(report: GeneratedReport): void {
    const token = this.authService.token || '';
    const downloadUrl = `${this.apiUrl}/${report.id}/download?token=${encodeURIComponent(token)}`;
    window.open(downloadUrl, '_blank');
  }

  formatCurrency(val: number, symbol: string): string {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0.00`;
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  }
}
