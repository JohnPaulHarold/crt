/**
 * @typedef {import('./libs/baseView.js')} BaseViewInstance
 */

import { Orientation } from '../enums/Orientation';
import { BaseView } from '../libs/baseView';

export interface AppOutlets {
    [index: string]: HTMLElement;
}

export type RouteParams = Record<string, string | number | boolean>;
export type RouteSearch = Record<string, string | number | boolean>;

export interface Route {
    default?: boolean;
    exact?: boolean;
    pattern: string;
    title?: string;
    id: string;
    viewClass: BaseViewInstance;
}

export interface ViewOptions {
    title?: string;
    id: string;
    params: RouteParams;
    search: RouteSearch;
}

export interface NavViewOptions extends ViewOptions {
    navItems: NavItem[];
}

export type StylesRecord = Record<string, string>;

export interface RailItem {
    title: string;
    id: string;
    url: string;
}
export interface RailData {
    title?: string;
    id: string;
    orientation?: Orientation;
    items: RailItem[];
}
export interface PageData {
    title?: string;
    id: string;
    items: RailData[];
}
export interface TileDataItem {
    url: string;
}

interface BaseComponentProps {
    id?: string;
    className?: sring;
}

export interface SimpleCarouselProps extends BaseComponentProps {
    id: string;
    data: RailData;
    blockExit?: string;
}

export interface CarouselProps extends BaseComponentProps {
    blockExit?: string;
    childQuery?: string;
    id: string;
    orientation: Orientation;
    startOffset?: number;
    title?: string;
}

export interface NavProps {
    navItems: NavItem[];
    id: string;
    blockExit?: string;
}

export interface TileProps {
    id: string;
    title: string;
}

export interface KeyboardKey {
    display: string;
    value: string;
    width?: number;
}

export interface KeyProps extends KeyboardKey {
    className?: string;
}

export interface KeyboardProps {
    keyMap: Array<Array<KeyboardKey>>;
}

export interface NavItem {
    id: string;
    title?: string;
    href: string;
}

type ListenerCallback = (payload: any) => void;

interface ListenerPayload {
    type: string;
    nextIndex?: number;
    offset?: number;
    direction?: Direction;
}
export interface StoreType {
    listeners: Record<string, ListenerCallback[]>;
    broadcast: (payload: any) => void;
    triggerListener: (id: string, payload: ListenerPayload) => void;
    listen: (id: string, callback: any) => void;
    unlisten: (id: string) => void;
}

export interface ButtonProps extends BaseComponentProps {
    text?: string;
    theme?: 'ghost' | 'none';
    icon?: string;
    iconPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export interface GridProps extends BaseComponentProps {
    columns: number;
}

export interface SpinnerProps extends BaseComponentProps {
    message?: string;
}

export interface LazyImageProps extends BaseComponentProps {
    src: string;
}

export interface SpinnerProps extends BaseComponentProps {
    message?: string;
}

export interface DialogProps extends BaseComponentProps {
    title?: string;
}

// note:
// props: Record<string, any>
// textOrArray: any
// children: ?
export type ShorthandMakeElement = (...args: any[]) => HTMLElement;
