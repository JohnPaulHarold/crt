import { DrmType } from "./DrmType";

/** @enum {string} */
export const DrmNames = {
  [DrmType.WIDEVINE]: "Google Widevine",
  [DrmType.PLAYREADY]: "Microsoft PlayReady",
  [DrmType.PLAYREADY_LEGACY]: "Microsoft PlayReady (Legacy)",
  [DrmType.FAIRPLAY]: "Apple FairPlay",
};
