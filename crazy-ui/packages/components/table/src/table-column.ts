/**
 * TableColumn — virtual component
 *
 * Only registers column definitions onto the parent Table.
 * Renders nothing by itself.
 *
 * Usage:
 *   <Table :data="data">
 *     <TableColumn dataIndex="name" title="Name" />
 *     <TableColumn dataIndex="age" title="Age" :sortable="true" />
 *   </Table>
 */

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TableColumn',
  props: {
    dataIndex: { type: String, default: undefined },
    title: { type: String, default: undefined },
    key: { type: String, default: undefined },
    width: { type: [String, Number], default: undefined },
    minWidth: { type: [String, Number], default: undefined },
    align: {
      type: String as () => 'left' | 'center' | 'right',
      default: undefined,
    },
    sortable: { type: Boolean, default: false },
    formatter: { type: Function, default: undefined },
  },
  setup() {
    // TableColumn is virtual: it renders nothing.
    // In a full implementation it would register itself with the parent Table.
    return () => null;
  },
});
