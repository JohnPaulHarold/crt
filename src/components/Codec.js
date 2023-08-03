/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div } from "../libs/makeElement"
import { DrmType } from "../enums/DrmType";

import s from './Codec.css';

/**
 * 
 * @param {CodecProps} props 
 * @returns {Element}
 */
export const Codec = (props) => div({ className: s.container },
  Object.keys(props.data).map(key => div({ className: s.box },
    div({ className: s.box }, `${key}`),
    div({ className: s.halfbox }, 'MSE ' + props.data[key].mse),
    div({ className: s.halfbox }, '<video /> ' + props.data[key].video),
    div({ className: s.box }, DrmType.WIDEVINE + ' ' + props.data[key][DrmType.WIDEVINE].drm?.supported),
    div({ className: s.thirdbox }, 'L1 ' + props.data[key][DrmType.WIDEVINE].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L1')?.supported),
    div({ className: s.thirdbox }, 'L2 ' + props.data[key][DrmType.WIDEVINE].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L2')?.supported),
    div({ className: s.thirdbox }, 'L3 ' + props.data[key][DrmType.WIDEVINE].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L3')?.supported),
    div({ className: s.box }, DrmType.FAIRPLAY + ' ' + props.data[key][DrmType.FAIRPLAY].drm?.supported),
    div({ className: s.thirdbox }, 'L1 ' + props.data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L1')?.supported),
    div({ className: s.thirdbox }, 'L2 ' + props.data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L2')?.supported),
    div({ className: s.thirdbox }, 'L3 ' + props.data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L3')?.supported),
    div({ className: s.box }, DrmType.PLAYREADY + ' ' + props.data[key][DrmType.PLAYREADY].drm?.supported),
    div({ className: s.thirdbox }, 'L1 ' + props.data[key][DrmType.PLAYREADY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L1')?.supported),
    div({ className: s.thirdbox }, 'L2 ' + props.data[key][DrmType.PLAYREADY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L2')?.supported),
    div({ className: s.thirdbox }, 'L3 ' + props.data[key][DrmType.PLAYREADY].drm?.securityLevels?.find((/** @type {{name: string, supported: string}} level */ level) => level.name === 'L3')?.supported),
  ))
)
