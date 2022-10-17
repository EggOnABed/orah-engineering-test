import { Person } from "shared/models/person";

export let sortBy: string = 'first_name';

export const compare = ( a: Person, b: Person )=>{
    if ( a[sortBy] < b[sortBy] ){
      return -1;
    }
    if ( a[sortBy] > b[sortBy] ){
      return 1;
    }
    return 0;
  }