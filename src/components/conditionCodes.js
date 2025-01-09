export const CONDITION_CODES = {
    ANY: '*ANY*',         // Show if the question has any value
    NONE: '*NONE*',       // Show if the question has no value
    NOT_EMPTY: '*NOT_EMPTY*', // Show if the question is not empty/null
    IS_EMPTY: '*EMPTY*',  // Show if the question is empty/null
    TRUE: '*TRUE*',       // Show if the question is true/yes/checked
    FALSE: '*FALSE*',     // Show if the question is false/no/unchecked
  };
  
  export const MULTI_VALUE_PREFIX = '*MULTI:'; // For multiple accepted values
  export const RANGE_PREFIX = '*RANGE:';      // For numeric ranges
  