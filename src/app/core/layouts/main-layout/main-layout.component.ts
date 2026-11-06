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
    .shell{min-height:100vh;display:grid;grid-template-columns:256px minmax(0,1fr)}app-sidebar{position:sticky;top:0;height:100vh}.work-area{min-width:0}.work-area>main{width:100%;max-width:1480px;margin:0 auto;padding:32px}.mobile-nav{display:none}@media(max-width:800px){.shell{display:block}.shell>app-sidebar{display:none}.work-area>main{padding:24px 16px 88px}.mobile-nav{position:fixed;z-index:20;left:0;right:0;bottom:0;height:68px;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--sm-border);background:#fff;box-shadow:0 -2px 6px rgb(15 23 42 / 6%)}.mobile-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--sm-muted);font-size:11px}.mobile-nav a span{font-size:18px;line-height:1}.mobile-nav a.active{color:var(--sm-primary);background:var(--sm-primary-soft)}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {}
