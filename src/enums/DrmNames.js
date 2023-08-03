import { DrmType } from "./DrmType";

/** @enum {string} */
export const DrmNames = {
    [DrmType.WIDEVINE]: "Google Widevine",
    [DrmType.PLAYREADY]: "Microsoft PlayReady",
    [DrmType.FAIRPLAY]: "Apple FairPlay",
  };