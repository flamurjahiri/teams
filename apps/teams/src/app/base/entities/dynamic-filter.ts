export class DynamicFilter {
  _id: string;
  name: string;
  count: string;

  [k: string]: any;

}


export const getIds = (data: DynamicFilter[]): string[] => {
  return (data || []).filter(d => d._id).map(d => d._id);
}
