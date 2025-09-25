import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SystemAdminTopMenuComponent } from "../../components/system-administation/sysadmin-top-menu/system-admin-top-menu.component";

@Component({
  selector: 'hh-system-admin-layout',
  imports: [RouterOutlet, SystemAdminTopMenuComponent],
  templateUrl: './system-admin-layout.html',
})
export class SystemAdministrationLayoutComponent { }
