import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

import EditableTable from '@/components/vuetable/EditableTable.vue';
import Enums from '@/utils/enums';

const fields = [
  {
    name: 'stop_name',
    title: 'Name',
    type: 'input',
  },
  {
    name: 'stop_lat',
    title: 'Lat',
    type: 'number',
  },
  {
    name: 'wheelchair_boarding',
    title: 'Wheelchair Boarding',
    type: 'simple-select',
    options: [
      { name: 'No Info', value: null },
      { name: 'Yes', value: 1 },
      { name: 'No', value: 2 },
    ],
  },
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
  it('applies the PATCH response to representative field types', async () => {
    const row = {
      id: 1,
      stop_name: 'Paradero Alfa Editado',
      stop_lat: -18.123,
      wheelchair_boarding: 1,
      parent_station: 2,
      parent_station_id: 'stop_a',
      changed: true,
      error: false,
      errors: {},
    };
    const responseRow = {
      id: 1,
      stop_name: 'Paradero Alfa Editado',
      stop_lat: -18.123,
      wheelchair_boarding: 1,
      parent_station: 2,
      parent_station_id: 'stop_b',
    };

    let sentRow = null;
    const updateMethod = (payload) => {
      sentRow = payload;
      return Promise.resolve({ data: responseRow });
    };

    const wrapper = mountEditableTable(updateMethod);
    const vuetable = wrapper.vm.$refs.vuetable;

    vuetable.tableData = [row];
    wrapper.vm.saveChanges();
    await flushPromises();

    expect(sentRow.stop_name).to.equal('Paradero Alfa Editado');
    expect(sentRow.stop_lat).to.equal(-18.123);
    expect(sentRow.wheelchair_boarding).to.equal(1);
    expect(sentRow.parent_station).to.equal(2);

    expect(row.stop_name).to.equal('Paradero Alfa Editado');
    expect(row.stop_lat).to.equal(-18.123);
    expect(row.wheelchair_boarding).to.equal(1);
    expect(row.parent_station_id).to.equal('stop_b');
    expect(row.changed).to.equal(false);
    expect(row.error).to.equal(false);
    expect(row.errors).to.deep.equal({});

    expect(vuetable.setDataCalls).to.equal(1);
    expect(vuetable.lastSetData[0].stop_name).to.equal('Paradero Alfa Editado');
    expect(vuetable.lastSetData[0].stop_lat).to.equal(-18.123);
    expect(vuetable.lastSetData[0].wheelchair_boarding).to.equal(1);
    expect(vuetable.lastSetData[0].parent_station_id).to.equal('stop_b');
  });
});
