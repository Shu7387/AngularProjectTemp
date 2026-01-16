import { Component, signal, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PatientListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal<string>('Shubham');

  constructor() {
    console.log('constructor is called');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges is called {0}', changes);
  }

  ngOnInit() {
    console.log('ngOnInit is called');
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit is called');
  }

  // ngDoCheck() {
  //   console.log('ngDoCheck is called');
  // }

  ngOnDestroy() {
    console.log('ngOnDestroy is called');
  }
}
