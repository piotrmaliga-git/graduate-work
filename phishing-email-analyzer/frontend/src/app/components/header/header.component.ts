import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
