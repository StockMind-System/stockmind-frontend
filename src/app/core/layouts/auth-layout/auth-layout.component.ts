import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandMarkComponent } from '../../../shared/components/brand-mark/brand-mark.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, BrandMarkComponent],
  template: `
    <main class="auth-shell">
      <section class="auth-story" aria-label="Presentación de StockMind">
        <app-brand-mark />
        <div class="story-copy">
          <h1>Cada producto.<br>Una mejor decisión.</h1>
          <p>Ventas, inventario y pronósticos en un solo lugar.<br>Decide qué reponer con información clara.</p>
        </div>

        <div class="demand-card">
          <span>Demanda que puedes anticipar</span>
          <div class="bars" aria-hidden="true">
            @for (height of historyBars; track $index) { <i class="history" [style.height.%]="height"></i> }
            @for (height of forecastBars; track $index) { <i class="forecast" [style.height.%]="height"></i> }
          </div>
          <footer><small>Historial de ventas</small><small>Próximas semanas</small></footer>
        </div>

        <p class="story-footer">Diseñado para MYPEs. Pensado para las personas.</p>
      </section>

      <section class="auth-content">
        <div class="mobile-brand"><app-brand-mark /></div>
        <div class="auth-card"><router-outlet /></div>
        <p class="copyright">© 2026 StockMind · Lima, Perú</p>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;min-height:100dvh}.auth-shell{min-height:100vh;min-height:100dvh;display:grid;grid-template-columns:minmax(430px,48%) minmax(0,1fr);background:#fff}.auth-story{height:100vh;height:100dvh;min-height:620px;display:flex;flex-direction:column;overflow:hidden;padding:clamp(28px,4.5vh,48px) clamp(34px,4vw,56px);color:#fff;background:var(--sm-navy)}.story-copy{margin-top:clamp(44px,11vh,118px)}h1{margin:0;font-size:clamp(34px,3.4vw,48px);line-height:1.28}p{margin:clamp(18px,3vh,30px) 0 0;color:#b8cbd1;font-size:clamp(15px,1.35vw,18px);line-height:1.45}.demand-card{width:min(100%,565px);margin-top:clamp(28px,7vh,68px);padding:clamp(20px,3vh,28px);border-radius:16px;background:var(--sm-navy-soft)}.demand-card>span{color:#a8c2c9;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.bars{height:clamp(118px,21vh,185px);display:flex;align-items:flex-end;gap:clamp(14px,2.4vw,32px);padding:clamp(22px,4vh,38px) 6px 0}.bars i{flex:1;max-width:30px;min-width:10px;border-radius:6px 6px 2px 2px;background:var(--sm-mint)}.bars .forecast{background:var(--sm-purple)}.demand-card footer{display:flex;justify-content:space-between;gap:16px;margin-top:clamp(14px,2.5vh,24px);color:#fff}.demand-card footer small:last-child{color:#d9d0f6}.story-footer{margin-top:auto;font-size:13px}.auth-content{min-width:0;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;flex-direction:column;overflow-y:auto;padding:clamp(28px,4vw,48px)}.auth-card{width:min(100%,520px);flex:0 0 auto}.mobile-brand{display:none}.copyright{width:max-content;max-width:100%;margin:clamp(28px,5vh,50px) 0 0;color:var(--sm-muted);font-size:12px;text-align:center}@media(max-width:1100px){.auth-shell{display:block}.auth-story{display:none}.auth-content{padding:32px 24px}.mobile-brand{width:min(100%,520px);display:block;margin:0 auto clamp(34px,6vh,56px)}.auth-card{margin:0 auto}.copyright{margin-top:36px}}@media(max-width:560px){.auth-content{align-items:stretch;padding:24px 20px}.mobile-brand{margin-bottom:38px}.auth-card{width:100%}.copyright{width:100%;font-size:11px}}@media(max-height:760px){.auth-content{justify-content:flex-start}}@media(max-height:700px) and (min-width:1101px){.story-copy{margin-top:30px}.demand-card{margin-top:22px}.bars{height:104px;padding-top:16px}.demand-card footer{margin-top:10px}.auth-story{min-height:560px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  readonly historyBars = [58, 76, 64, 91, 81];
  readonly forecastBars = [100, 90, 104];
}
