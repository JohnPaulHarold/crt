export type SecurityLevel = {
  name: string;
  supported: boolean;
};

export interface IDrm {
  type: DrmType;
  keySystem: KeySystem;
  supported: boolean;
  securityLevels: SecurityLevel[];
}
