// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, retry, filter } from 'rxjs/operators';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  /** Base API endpoint served by JSON Server */
  private readonly apiUrl: string = 'http://localhost:3000/patients';

  constructor(private http: HttpClient) {
    console.log('PatientService initialized - using JSON Server API');
  }

  /** GET: Retrieve all patients */
  public getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl).pipe(
      retry(2), // retry transient failures up to 2 times
      tap((patients) => console.log('Patients fetched from API:', patients.length)),
      catchError(this.handleError),
    );
  }

  /** GET: Retrieve a single patient by id */
  public getPatientById(id: number | string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      tap((patient) => console.log('Patient fetched:', patient)),
      catchError(this.handleError),
    );
  }

  /** POST: Create a new patient (JSON body) */
  public createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    console.log(patient);
    debugger;

    return this.http.post<Patient>(this.apiUrl, patient, this.jsonOptions()).pipe(
      tap((newPatient) => console.log('Patient created:', newPatient)),
      catchError(this.handleError),
    );
  }

  /** PUT: Update an existing patient by id (partial payload supported) */
  public updatePatient(id: number | string, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient, this.jsonOptions()).pipe(
      tap((updatedPatient) => console.log('Patient updated:', updatedPatient)),
      catchError(this.handleError),
    );
  }

  /** DELETE: Remove a patient by id */
  public deletePatient(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Patient deleted:', id)),
      catchError(this.handleError),
    );
  }

  /**
   * Search patients (client-side): filters the array returned by getAllPatients
   * Matches on firstName, lastName, or email (case-insensitive)
   */
  public searchPatients(term: string): Observable<Patient[]> {
    return this.getAllPatients().pipe(
      map((patients) => {
        const q = term.trim().toLowerCase();
        if (!q) return patients;
        return patients.filter(
          (p) =>
            p.firstName?.toLowerCase().includes(q) ||
            p.lastName?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q),
        );
      }),
    );
  }

  /**
   * Filter by status (client-side): returns all when status === 'all'
   * Otherwise returns only patients whose status matches exactly
   */
  public filterByStatus(status: string): Observable<Patient[]> {
    return this.getAllPatients().pipe(
      map((patients) =>
        status === 'all' ? patients : patients.filter((p) => p.status === status),
      ),
    );
  }

  /** Convenience: get only 'critical' patients (client-side) */
  public getCriticalPatients(): Observable<Patient[]> {
    return this.getAllPatients().pipe(
      map((patients) => patients.filter((p) => p.status === 'critical')),
    );
  }

  /**
   * Shared error handler for HTTP calls
   * Converts HttpErrorResponse into a user-friendly Error
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  };

  /** Common JSON options for POST/PUT requests */
  private jsonOptions() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }
}
