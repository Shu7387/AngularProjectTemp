import { Injectable } from '@angular/core';

// Logger service - demonstrating component-level injection
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logs: string[] = [];

  log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  error(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    this.logs.push(logMessage);
    console.error(logMessage);
  }

  warn(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    this.logs.push(logMessage);
    console.warn(logMessage);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
