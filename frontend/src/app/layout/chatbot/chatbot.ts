import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatService, ChatMessage, ChatAction } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class ChatbotComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  showWelcomePopover = false;
  userInput = '';
  messages: ChatMessage[] = [];
  suggestions: string[] = [];
  currencySymbol = '$';
  private autoDismissTimer: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currencySymbol = this.authService.getCurrencySymbol();
    this.loadSuggestions();

    // Listen to router navigation events to trigger Dashboard welcome popover
    this.checkDashboardRoute(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkDashboardRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkDashboardRoute(url: string): void {
    if (url.includes('/dashboard')) {
      const alreadyShown = sessionStorage.getItem('taxpal_ai_dashboard_welcomed');
      if (!alreadyShown && !this.isOpen) {
        this.showWelcomePopover = true;
        sessionStorage.setItem('taxpal_ai_dashboard_welcomed', 'true');
        
        if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
        this.autoDismissTimer = setTimeout(() => {
          this.showWelcomePopover = false;
          this.cdr.detectChanges();
        }, 9000);
      }
    } else {
      this.showWelcomePopover = false;
    }
  }

  dismissWelcomePopover(event: MouseEvent): void {
    event.stopPropagation();
    this.showWelcomePopover = false;
    if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
  }

  openChatFromPopover(): void {
    this.showWelcomePopover = false;
    if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showWelcomePopover = false;
      if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
      if (this.messages.length === 0) {
        this.loadHistory();
      }
    }
  }

  loadHistory(): void {
    this.isLoading = true;
    this.chatService.getHistory().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = res.data;
        }
        this.isLoading = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load chat history:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSuggestions(): void {
    this.chatService.getSuggestions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.suggestions = res.data;
        }
      }
    });
  }

  sendMessage(text?: string): void {
    const messageToSend = text || this.userInput;
    if (!messageToSend || messageToSend.trim() === '' || this.isLoading) {
      return;
    }

    const cleanText = messageToSend.trim();
    this.userInput = '';

    // Append user message immediately
    this.messages.push({
      role: 'user',
      message: cleanText,
      createdAt: new Date()
    });

    this.isLoading = true;
    this.scrollToBottom();

    this.chatService.sendMessage(cleanText).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.messages.push({
            role: 'assistant',
            message: res.message,
            action: res.action,
            createdAt: new Date()
          });
        }
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({
          role: 'assistant',
          message: 'Sorry, I could not process your request at the moment. Please try again.',
          createdAt: new Date()
        });
        this.scrollToBottom();
        this.cdr.detectChanges();
      }
    });
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear conversation history?')) {
      this.chatService.clearHistory().subscribe({
        next: () => {
          this.messages = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSelectSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  onNavigate(route?: string): void {
    if (route) {
      this.router.navigateByUrl(route);
    }
  }

  onDownloadFile(action: ChatAction): void {
    if (!action || !action.downloadUrl) return;

    let fullUrl = action.downloadUrl;
    if (!fullUrl.startsWith('http')) {
      fullUrl = `${environment.apiUrl.replace('/api', '')}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
    }

    window.open(fullUrl, '_blank');
  }

  formatCurrency(val?: number): string {
    if (val === undefined || val === null || isNaN(val)) return `${this.currencySymbol}0.00`;
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${this.currencySymbol}${formatted}` : `${this.currencySymbol}${formatted}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}
