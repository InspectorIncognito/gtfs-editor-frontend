import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

import FKSelect from '@/components/vuetable/inputs/FKSelect.vue';

const field = {
  name: 'parent_station_id',
  id_field: 'parent_station',
  fk_name: 'stop_id',
  nullable: true,
  type: 'fk-select',
  ajax_params: {
    url: '/api/projects/1/stops/',
  },
};

function mountFKSelect(data, value) {
  return shallowMount(FKSelect, {
    propsData: {
      field,
      data,
      value,
      errors: [],
      readonly: true,
    },
    mocks: {
      $t: (key) => key,
    },
  });
}

describe('FKSelect', () => {
  it('uses the fetched option label when the display field is stale', () => {
    const data = {
      parent_station: 2,
      parent_station_id: 'stop_a',
    };
    const wrapper = mountFKSelect(data, 2);

    wrapper.vm.options = [{ name: 'stop_b', value: 2 }];
    wrapper.vm.setOption();

    expect(wrapper.vm.selectedOption.name).to.equal('stop_b');
    expect(wrapper.vm.val.value).to.equal(2);
  });

  it('clears the selection when the value is removed', () => {
    const data = {
      parent_station: 2,
      parent_station_id: 'stop_b',
    };
    const wrapper = mountFKSelect(data, 2);

    expect(wrapper.vm.selectedOption.name).to.equal('stop_b');

    data.parent_station = null;
    wrapper.vm.setOption();

    expect(wrapper.vm.selectedOption).to.equal(null);
    expect(wrapper.vm.val).to.equal(null);
  });

  it('updates selectedOption and emits the id on change', () => {
    const wrapper = mountFKSelect({
      parent_station: null,
      parent_station_id: null,
    }, null);

    wrapper.vm.onChange({ name: 'stop_b', value: 2 });

    expect(wrapper.vm.selectedOption.name).to.equal('stop_b');
    expect(wrapper.emitted().input[0]).to.deep.equal([2]);

    wrapper.vm.onChange(null);

    expect(wrapper.vm.selectedOption).to.equal(null);
    expect(wrapper.emitted().input[1]).to.deep.equal([null]);
  });

  it('falls back to the row display value in readonly mode', async () => {
    const data = {
      parent_station: 2,
      parent_station_id: 'stop_b',
    };
    const wrapper = mountFKSelect(data, 2);

    wrapper.vm.selectedOption = null;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).to.contain('stop_b');
  });
});
