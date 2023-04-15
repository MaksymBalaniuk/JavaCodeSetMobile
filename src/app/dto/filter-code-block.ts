import {CodeBlockType} from "../enumeration/code-block-type";

export interface FilterCodeBlock {
  filterQuery: string;
  filterTitle: boolean;
  filterDescription: boolean;
  filterContent: boolean;
  filterTags: boolean;
  allowedTypes: Array<CodeBlockType>;
}
