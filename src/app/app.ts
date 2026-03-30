import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly emailPlaceholder = 'your@email.com';
  protected readonly passwordPlaceholder = 'Enter your password';
}
