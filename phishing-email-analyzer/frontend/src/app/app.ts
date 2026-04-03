import { Component, inject } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'root',
  imports: [RouterOutlet],
  template: `<router-outlet data-testid="app-router-outlet"></router-outlet>`,
})
export class AppComponent {
  private readonly _theme = inject(ThemeService);
}
