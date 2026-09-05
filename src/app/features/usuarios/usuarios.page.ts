import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-usuarios-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Usuarios" /><div class="panel">Administración de usuarios</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class UsuariosPage {}
