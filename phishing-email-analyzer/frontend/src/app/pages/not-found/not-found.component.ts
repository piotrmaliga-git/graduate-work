import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'not-found-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `<div class="w-full h-full flex flex-col items-center justify-center py-24">
    <h1 class="text-5xl font-bold text-blue-700 mb-4">404</h1>
    <p class="text-lg text-gray-600 mb-8">Page not found.</p>
    <a routerLink="/" class="text-blue-600 hover:underline">Go back to home</a>
  </div> `,
})
export class NotFoundPageComponent {}
