import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';
import propertySchemasIndex from '/imports/api/properties/computedPropertySchemasIndex.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';

let CreatureProperties = new Mongo.Collection('creatureProperties');

let CreaturePropertySchema = new SimpleSchema({
	type: {
    type: String,
    allowedValues: Object.keys(propertySchemasIndex),
  },
	tags: {
		type: Array,
		defaultValue: [],
	},
	'tags.$': {
		type: String,
	},
	disabled: {
		type: Boolean,
		optional: true,
	},
  icon: {
    type: storedIconsSchema,
    optional: true,
  },
  // Denormalised flag if this property is inactive on the sheet for any reason
  // Including being disabled, or a decendent of a disabled property
  inactive: {
    type: Boolean,
    optional: true,
    index: 1,
  },
  // Denormalised flag if this property was made inactive by an inactive
  // ancestor. True if this property has an inactive ancestor even if this
  // property is itself inactive
  deactivatedByAncestor: {
    type: Boolean,
    optional: true,
    index: 1,
  },
  // Denormalised list of all properties or creatures this property depends on
  dependencies: {
    type: Array,
    defaultValue: [],
    index: 1,
  },
  'dependencies.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

for (let key in propertySchemasIndex){
	let schema = new SimpleSchema({});
	schema.extend(propertySchemasIndex[key]);
	schema.extend(CreaturePropertySchema);
  schema.extend(ColorSchema);
	schema.extend(ChildSchema);
	schema.extend(SoftRemovableSchema);
	CreatureProperties.attachSchema(schema, {
		selector: {type: key}
	});
}

import '/imports/api/creature/creatureProperties/methods/index.js';
import '/imports/api/creature/actions/doAction.js';
import '/imports/api/creature/actions/castSpellWithSlot.js';

export default CreatureProperties;
export {
	CreaturePropertySchema,
};
