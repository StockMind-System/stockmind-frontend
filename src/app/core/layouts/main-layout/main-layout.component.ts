import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout', standalone: true, imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `<app-navbar /><div class="shell"><app-sidebar /><main><router-outlet /></main></div>`,
  styles: [`.shell{display:grid;grid-template-columns:240px 1fr;min-height:calc(100vh - 64px)}main{padding:1.5rem}@media(max-width:800px){.shell{grid-template-columns:1fr}app-sidebar{display:none}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {}
