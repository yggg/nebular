/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, HostBinding, Input } from '@angular/core';

import { NbComponentSize } from '../component-size';
import { NbSpinnerStatus } from './spinner-status';

/**
 * Styled spinner component
 *
 * @styles
 *
 * spinner-background-color:
 * spinner-circle-filled-color:
 * spinner-circle-empty-color:
 * spinner-text-color:
 * spinner-text-font-family:
 * spinner-text-font-size:
 * spinner-text-font-weight:
 * spinner-text-line-height:
 * spinner-primary-circle-filled-color:
 * spinner-primary-circle-empty-color:
 * spinner-info-circle-filled-color:
 * spinner-info-circle-empty-color:
 * spinner-success-circle-filled-color:
 * spinner-success-circle-empty-color:
 * spinner-warning-circle-filled-color:
 * spinner-warning-circle-empty-color:
 * spinner-danger-circle-filled-color:
 * spinner-danger-circle-empty-color:
 * spinner-white-circle-filled-color:
 * spinner-white-circle-empty-color:
 * spinner-height-xxsmall:
 * spinner-height-xsmall:
 * spinner-height-small:
 * spinner-height-medium:
 * spinner-height-large:
 * spinner-height-xlarge:
 * spinner-height-xxlarge:
 */
@Component({
  selector: 'nb-spinner',
  template: `
    <span class="spin-circle"></span>
    <span class="message" *ngIf="message">{{ message }}</span>
  `,
  styleUrls: ['./spinner.component.scss'],
})
export class NbSpinnerComponent {

  status: NbSpinnerStatus;

  /**
   * Loading text that is shown near the icon
   * @type string
   */
  @Input()
  message: string = 'Loading...';

  /**
   * Spinner size, available sizes:
   * tiny, small, medium, large, giant
   * @param {string} value
   */
  @Input()
  size: NbComponentSize = 'medium';

  /**
   * Spinner status (adds specific styles):
   * primary, info, success, warning, danger, white
   * @param {string} value
   */
  @Input('status')
  private set setStatus(value: NbSpinnerStatus) {
    this.status = value;
  }

  @HostBinding('class.size-tiny')
  get tiny() {
    return this.size === 'tiny';
  }

  @HostBinding('class.size-small')
  get small() {
    return this.size === 'small';
  }

  @HostBinding('class.size-medium')
  get medium() {
    return this.size === 'medium';
  }

  @HostBinding('class.size-large')
  get large() {
    return this.size === 'large';
  }

  @HostBinding('class.size-giant')
  get giant() {
    return this.size === 'giant';
  }

  @HostBinding('class.status-primary')
  get primary() {
    return this.status === NbSpinnerStatus.PRIMARY;
  }

  @HostBinding('class.status-info')
  get info() {
    return this.status === NbSpinnerStatus.INFO;
  }

  @HostBinding('class.status-success')
  get success() {
    return this.status === NbSpinnerStatus.SUCCESS;
  }

  @HostBinding('class.status-warning')
  get warning() {
    return this.status === NbSpinnerStatus.WARNING;
  }

  @HostBinding('class.status-danger')
  get danger() {
    return this.status === NbSpinnerStatus.DANGER;
  }

  @HostBinding('class.status-white')
  get white() {
    return this.status === NbSpinnerStatus.WHITE;
  }
}
