import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatAction {
  type: 'DOWNLOAD' | 'NAVIGATE' | 'VIEW' | 'CREATE';
  fileType?: string;
  fileName?: string;
  downloadUrl?: string;
  route?: string;
  label?: string;
  view?: 'BUDGET_SUMMARY' | 'SPENDING_BREAKDOWN' | 'TAX_SUMMARY' | 'TRANSACTION_SUMMARY';
  data?: any;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  action?: ChatAction | null;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<{ success: boolean; message: string; action: ChatAction | null }> {
    return this.http.post<{ success: boolean; message: string; action: ChatAction | null }>(this.apiUrl, { message });
  }

  getHistory(): Observable<{ success: boolean; data: ChatMessage[] }> {
    return this.http.get<{ success: boolean; data: ChatMessage[] }>(`${this.apiUrl}/history`);
  }

  clearHistory(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/history`);
  }

  getSuggestions(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/suggestions`);
  }
}
