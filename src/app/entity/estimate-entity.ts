import {EstimateType} from "../enumeration/estimate-type";

export interface EstimateEntity {
  id: string;
  type: EstimateType;
  userId: string;
  codeBlockId: string;
}
