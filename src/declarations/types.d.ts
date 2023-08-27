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
    params?: RouteParams;
    search?: RouteSearch;
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
    backStop?: string;
}

export interface NavProps {
    blockExit?: string;
    id: string;
    navItems: NavItem[];
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

export type ContainerType =
    | 'video/mp4'
    | 'video/webm'
    | 'application/vnd.apple.mpegurl';

export type Codec = { title: string; contentType: string };

export type CodecProps = {
    data: Record<string, any>;
    codec: string;
    type: string;
    title: string;
};

export type DrmSupportsProps = { data: Record<string, any>; drmType: string };
export type DrmSupportsLevelsProps = {
    data: any[];
};
