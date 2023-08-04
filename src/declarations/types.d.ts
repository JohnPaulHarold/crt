import { Orientation } from '../enums/Orientation';
import { BaseView } from '../libs/baseView';

export interface Outlet {
    id: string;
}

export interface AppOutlets {
    [index: string]: Outlet;
}

export type RouteParams = Record<string, string | number | boolean>;
export type RouteSearch = Record<string, string | number | boolean>;

export interface Route {
    default?: boolean;
    pattern: string;
    title?: string;
    id: string;
    viewClass: typeof BaseView;
    handler: ({
        route: Route,
        params: RouteParams,
        search: RouteSearch,
    }) => void;
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
    id: string;
    title?: string;
    orientation: Orientation;
    childQuery?: string;
    blockExit?: string;
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

export interface GridProps extends BaseComponentProps {
    data: any;
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

// note:
// props: Record<string, any>
// textOrArray: any
// children: ?
export type ShorthandMakeElement = (...args: any[]) => HTMLElement;
