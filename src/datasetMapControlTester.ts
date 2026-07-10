import {
  and,
  isObjectControl,
  rankWith,
  schemaMatches,
  RankedTester,
} from '@jsonforms/core';

// Matches object controls that act as a map of arbitrarily-named entries,
// i.e. objects defined via `additionalProperties` (and no fixed `properties`).
export default rankWith(
  5,
  and(
    isObjectControl,
    schemaMatches(
      (schema) =>
        schema != null &&
        typeof schema.additionalProperties === 'object' &&
        schema.additionalProperties !== null &&
        (schema.properties == null ||
          Object.keys(schema.properties).length === 0)
    )
  )
) as RankedTester;
