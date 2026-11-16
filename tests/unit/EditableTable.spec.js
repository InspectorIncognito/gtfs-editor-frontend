import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

import EditableTable from '@/components/vuetable/EditableTable.vue';
import Enums from '@/utils/enums';

const fields = [
  {
    name: 'parent_station_id',
    title: 'Parent Station',
    foreignKey: true,
    id_field: 'parent_station',
    type: 'fk-select',
  },
];

const VuetableStub = {
  name: 'Vuetable',
  data() {
    return {
      tableData: [],
      setDataCalls: 0,
      lastSetData: null,
    };
  },
  methods: {
    setData(data) {
      this.tableData = data;
      this.setDataCalls += 1;
      this.lastSetData = data;
    },
  },
  render(h) {
    return h('div', { attrs: { 'data-cy': 'vuetable-stub' } });
  },
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

function mountEditableTable(updateMethod) {
  return shallowMount(EditableTable, {
    propsData: {
      fields,
      url: '/api/projects/1/stops/',
      createMethod: () => Promise.resolve({ data: {} }),
      updateMethod,
      deleteMethod: () => Promise.resolve(),
      uploadCSV: () => Promise.resolve(),
      downloadCSV: () => Promise.resolve(),
      searchable: false,
    },
    mocks: {
      $route: { query: {}, params: { projectId: 1 } },
      $t: (key) => key,
      $tc: (key) => key,
      Enums,
    },
    stubs: {
      Vuetable: VuetableStub,
    },
  });
}

describe('EditableTable', () => {
  it('applies the PATCH response to the saved row', async () => {
    const row = {
      id: 1,
      parent_station: 2,
      parent_station_id: 'stop_a',
      changed: true,
      error: false,
      errors: {},
    };
    const responseRow = {
      id: 1,
      parent_station: 2,
      parent_station_id: 'stop_b',
    };

    const wrapper = mountEditableTable(() => Promise.resolve({ data: responseRow }));
    const vuetable = wrapper.vm.$refs.vuetable;

    vuetable.tableData = [row];
    wrapper.vm.saveChanges();
    await flushPromises();

    expect(row.parent_station_id).to.equal('stop_b');
    expect(row.changed).to.equal(false);
    expect(row.error).to.equal(false);
    expect(row.errors).to.deep.equal({});
    expect(vuetable.setDataCalls).to.equal(1);
    expect(vuetable.lastSetData[0].parent_station_id).to.equal('stop_b');
  });
});
