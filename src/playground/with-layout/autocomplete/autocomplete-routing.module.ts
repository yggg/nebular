/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Route} from '@angular/router';
import { AutocompleteShowcaseComponent } from './autocomplete-showcase.component';
import { AutocompleteDataSourceComponent } from './autocomplete-datasource.component';
import { AutocompleteFormComponent } from './autocomplete-form.component';

const routes: Route[] = [
  {
    path: 'autocomplete.component',
    component: AutocompleteShowcaseComponent,
  },
  {
    path: 'autocomplete-datasource.component',
    component: AutocompleteDataSourceComponent,
  },
  {
    path: 'autocomplete-form.component',
    component: AutocompleteFormComponent,
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class AutocompleteRoutingModule {}
