import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, SidebarComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <div class="work-area">
        <app-navbar />
        <main><router-outlet /></main>
      </div>
      <nav class="mobile-nav" aria-label="Navegación móvil">
        <a routerLink="/dashboard" routerLinkActive="active"><span>⌗</span>Inicio</a>
        <a routerLink="/ventas" routerLinkActive="active"><span>▥</span>Ventas</a>
        <a routerLink="/inventario" routerLinkActive="active"><span>◇</span>Inventario</a>
        <a routerLink="/productos" routerLinkActive="active"><span>•••</span>Más</a>
      </nav>
    </div>
  `,
  styles: [`
    .shell{min-height:100vh;display:grid;grid-template-columns:240px minmax(0,1fr)}app-sidebar{position:sticky;top:0;height:100vh}.work-area{min-width:0}.work-area>main{width:100%;max-width:1440px;margin:0 auto;padding:38px 32px 28px}.mobile-nav{display:none}@media(max-width:800px){.shell{display:block}.shell>app-sidebar{display:none}.work-area>main{padding:34px 20px 104px}.mobile-nav{position:fixed;z-index:20;left:0;right:0;bottom:0;height:81px;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--sm-border);background:#fff}.mobile-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--sm-muted);font-size:11px}.mobile-nav a span{font-size:20px;line-height:1}.mobile-nav a.active{color:var(--sm-primary)}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {}
