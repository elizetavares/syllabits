<template>
  <b-field v-if="allowEditing" label-position="on-border" v-bind="{label, ...$attrs}">
    <component :is="control"
      v-bind="{...controlOptions, value}"
      v-on="$listeners"/>
  </b-field>
  <component v-else :is="tag" :class="customClass">
    <slot v-bind="{value}"/>
  </component>
</template>

<script>
import { BInput } from 'buefy/dist/components/input'
import ResizableInput from './ResizableInput'

const controlLookup = {
  'input': BInput,
  'input-resizable': ResizableInput,
}

/**
 * A component meant to wrap a editable field.
 * The ability to edit can be toggled on/off.
 */
export default {

    name: 'Editable',
    inheritAttrs: false,

    props: {
      customClass: { default: '' },
      value: { required: true },
      controlType: { default: 'input' },
      controlOptions: { type: Object },
      tag: { default: 'span' },
      labelKey: { type: String }, // Used to create the default field options
    },

    computed: {
      control() {
        return controlLookup[this.controlType];
      },
      label() {
        return this.labelKey ? this.$translation.get('label.' + this.labelKey) : null;
      },
      allowEditing() {
        return this.editRoot?.allowEditing;
      },
    },
    /**
     * Each editable component looks for nearest ancestor with the 'allowEditing' attribute,
     * and inherits it if it can. This creates a sort of "editing context" and makes uses the
     * component much cleaner. (Avoids passing props everywhere)
     */
    beforeCreate() {
      let c = this;
      while (c) {
        if (c.allowEditing !== undefined) break;
        c = c.$parent;
      }
      this.editRoot = c;
    },

}
</script>