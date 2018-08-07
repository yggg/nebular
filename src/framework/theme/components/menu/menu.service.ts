/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Params } from '@angular/router';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { share } from 'rxjs/operators';
import { isUrlPathContain, isUrlPathEqual } from './url-matching-helpers';

export interface NbMenuBag { tag: string; item: NbMenuItem }

const itemClick$ = new ReplaySubject<NbMenuBag>(1);
const addItems$ = new ReplaySubject<{ tag: string; items: NbMenuItem[] }>(1);
const navigateHome$ = new ReplaySubject<{ tag: string }>(1);
const getSelectedItem$
  = new ReplaySubject<{ tag: string; listener: BehaviorSubject<NbMenuBag> }>(1);
const itemSelect$ = new ReplaySubject<NbMenuBag>(1);
const itemHover$ = new ReplaySubject<NbMenuBag>(1);
const submenuToggle$ = new ReplaySubject<NbMenuBag>(1);
const collapseAll$ = new ReplaySubject<{ tag: string }>(1);

// TODO: check if we need both URL and LINK
/**
 * Menu Item options
 */
export class NbMenuItem {
  /**
   * Item Title
   * @type {string}
   */
  title: string;
  /**
   * Item relative link (for routerLink)
   * @type {string}
   */
  link?: string;
  /**
   * Item URL (absolute)
   * @type {string}
   */
  url?: string;
  /**
   * Icon class name
   * @type {string}
   */
  icon?: string;
  /**
   * Expanded by defaul
   * @type {boolean}
   */
  expanded?: boolean;
  /**
   * Children items
   * @type {List<NbMenuItem>}
   */
  children?: NbMenuItem[];
  /**
   * Children items height
   * @type {number}
   */
  subMenuHeight?: number = 0;
  /**
   * HTML Link target
   * @type {string}
   */
  target?: string;
  /**
   * Hidden Item
   * @type {boolean}
   */
  hidden?: boolean;
  /**
   * Item is selected when partly or fully equal to the current url
   * @type {string}
   */
  pathMatch?: string = 'full';
  /**
   * Where this is a home item
   * @type {boolean}
   */
  home?: boolean;
  /**
   * Whether the item is just a group (non-clickable)
   * @type {boolean}
   */
  group?: boolean;
  /** Map of query parameters
   *@type {Params}
   */
  queryParams?: Params;
  parent?: NbMenuItem;
  selected?: boolean;
  data?: any;
  fragment?: string;

  /**
   * @returns item parents in top-down order
   */
  static getParents(item: NbMenuItem): NbMenuItem[] {
    const parents = [];

    let parent = item.parent;
    while (parent) {
      parents.unshift(parent);
      parent = parent.parent;
    }

    return parents;
  }

  static isParent(item, possibleChild: NbMenuItem): boolean {
    return possibleChild.parent
      ? possibleChild.parent === item || this.isParent(item, possibleChild.parent)
      : false;
  }
}

// TODO: map select events to router change events
// TODO: review the interface
/**
 * Menu Service. Allows you to listen to menu events, or to interact with a menu.
 */
@Injectable()
export class NbMenuService {

  /**
   * Add items to the end of the menu items list
   * @param {List<NbMenuItem>} items
   * @param {string} tag
   */
  addItems(items: NbMenuItem[], tag?: string) {
    addItems$.next({ tag, items });
  }

  /**
   * Collapses all menu items
   * @param {string} tag
   */
  collapseAll(tag?: string) {
    collapseAll$.next({ tag });
  }

  /**
   * Navigate to the home menu item
   * @param {string} tag
   */
  navigateHome(tag?: string) {
    navigateHome$.next({ tag });
  }

  /**
   * Returns currently selected item. Won't subscribe to the future events.
   * @param {string} tag
   * @returns {Observable<{tag: string; item: NbMenuItem}>}
   */
  getSelectedItem(tag?: string): Observable<NbMenuBag> {
    const listener = new BehaviorSubject<NbMenuBag>(null);

    getSelectedItem$.next({ tag, listener });

    return listener.asObservable();
  }

  onItemClick(): Observable<NbMenuBag> {
    return itemClick$.pipe(share());
  }

  onItemSelect(): Observable<NbMenuBag> {
    return itemSelect$.pipe(share());
  }

  onItemHover(): Observable<NbMenuBag> {
    return itemHover$.pipe(share());
  }

  onSubmenuToggle(): Observable<NbMenuBag> {
    return submenuToggle$.pipe(share());
  }
}

@Injectable()
export class NbMenuInternalService {

  constructor(private location: Location) {}

  prepareItems(items: NbMenuItem[]) {
    const defaultItem = new NbMenuItem();
    items.forEach(i => {
      this.applyDefaults(i, defaultItem);
      this.setParent(i);
    });
  }

  selectFromUrl(items: NbMenuItem[], tag: string, collapseOther: boolean = false) {
    const selectedItem = this.findItemByUrl(items);
    if (selectedItem) {
      this.selectItem(selectedItem, items, collapseOther, tag);
    }
  }

  selectItem(item: NbMenuItem, items: NbMenuItem[], collapseOther: boolean = false, tag: string) {
    const unselectedItems = this.resetSelection(items);
    const collapsedItems = collapseOther ? this.collapseItems(items) : [];

    for (const parent of NbMenuItem.getParents(item)) {
      parent.selected = true;
      // emit event only for items that weren't selected before ('unselectedItems' contains items that were selected)
      if (!unselectedItems.includes(parent)) {
        this.itemSelect(parent, tag);
      }

      parent.expanded = true;
      // emit event only for items that weren't expanded before ('collapsedItems' contains items that were expanded)
      if (!collapsedItems.includes(parent)) {
        this.submenuToggle(parent, tag);
      }
    }

    item.selected = true;
    // emit event only for items that weren't selected before ('unselectedItems' contains items that were selected)
    if (!unselectedItems.includes(item)) {
      this.itemSelect(item, tag);
    }
  }

  collapseAll(items: NbMenuItem[], tag: string, except?: NbMenuItem) {
    const collapsedItems = this.collapseItems(items, except);

    for (const item of collapsedItems) {
      this.submenuToggle(item, tag);
    }
  }

  onAddItem(): Observable<{ tag: string; items: NbMenuItem[] }> {
    return addItems$.pipe(share());
  }

  onNavigateHome(): Observable<{ tag: string }> {
    return navigateHome$.pipe(share());
  }

  onCollapseAll(): Observable<{ tag: string }> {
    return collapseAll$.pipe(share());
  }

  onGetSelectedItem(): Observable<{ tag: string; listener: BehaviorSubject<NbMenuBag> }> {
    return getSelectedItem$.pipe(share());
  }

  itemHover(item: NbMenuItem, tag?: string) {
    itemHover$.next({tag, item});
  }

  submenuToggle(item: NbMenuItem, tag?: string) {
    submenuToggle$.next({tag, item});
  }

  itemSelect(item: NbMenuItem, tag?: string) {
    itemSelect$.next({tag, item});
  }

  itemClick(item: NbMenuItem, tag?: string) {
    itemClick$.next({tag, item});
  }

  /**
   * Unselect all given items deeply.
   * @param items array of items to unselect.
   * @returns items which selected value was changed.
   */
  private resetSelection(items: NbMenuItem[]): NbMenuItem[] {
    const unselectedItems = [];

    for (const item of items) {
      if (item.selected) {
        unselectedItems.push(item);
      }
      item.selected = false;

      if (item.children) {
        unselectedItems.push(...this.resetSelection(item.children));
      }
    }

    return unselectedItems;
  }

  /**
   * Collapse all given items deeply.
   * @param items array of items to collapse.
   * @param except menu item which shouldn't be collapsed, also disables collapsing for parents of this item.
   * @returns items which expanded value was changed.
   */
  private collapseItems(items: NbMenuItem[], except?: NbMenuItem): NbMenuItem[] {
    const collapsedItems = [];

    for (const item of items) {
      if (except && (item === except || NbMenuItem.isParent(item, except))) {
        continue;
      }

      if (item.expanded) {
        collapsedItems.push(item)
      }
      item.expanded = false;

      if (item.children) {
        collapsedItems.push(...this.collapseItems(item.children));
      }
    }

    return collapsedItems;
  }

  private applyDefaults(item, defaultItem) {
    const menuItem = {...item};
    Object.assign(item, defaultItem, menuItem);
    item.children && item.children.forEach(child => {
      this.applyDefaults(child, defaultItem);
    });
  }

  private setParent(item: NbMenuItem) {
    item.children && item.children.forEach(child => {
      child.parent = item;
      this.setParent(child);
    });
  }

  /**
   * Find deepest item which link matches current URL path.
   * @param items array of items to search in.
   * @returns found item of undefined.
   */
  private findItemByUrl(items: NbMenuItem[]): NbMenuItem | undefined {
    let selectedItem;

    items.some(item => {
      if (item.children) {
        selectedItem = this.findItemByUrl(item.children);
      }
      if (!selectedItem && this.isSelectedInUrl(item)) {
        selectedItem = item;
      }

      return selectedItem;
    });

    return selectedItem;
  }

  private isSelectedInUrl(item: NbMenuItem): boolean {
    const exact: boolean = item.pathMatch === 'full';
    return exact
      ? isUrlPathEqual(this.location.path(), item.link)
      : isUrlPathContain(this.location.path(), item.link);
  }
}
