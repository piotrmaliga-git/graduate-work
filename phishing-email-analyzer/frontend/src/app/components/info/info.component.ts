import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info.component.html',
})
export class InfoComponent {}
