import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'page-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
})
export class FooterComponent {}
