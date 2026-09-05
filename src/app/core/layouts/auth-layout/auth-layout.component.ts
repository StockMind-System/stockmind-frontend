import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout', standalone: true, imports: [RouterOutlet],
  template: `<main class="auth"><section><h1>StockMind</h1><router-outlet /></section></main>`,
  styles: [`.auth{min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#eef2ff}.auth section{width:min(100%,420px);padding:2rem;background:white;border-radius:1rem;box-shadow:0 12px 30px #17203318}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
