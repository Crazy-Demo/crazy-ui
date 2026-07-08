import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Col from '../src/col.vue';
import Row from '../../row/src/row.vue';

function createCol(props = {}, parentProps = {}) {
  return mount(Row, {
    props: parentProps,
    slots: {
      default: () => mount(Col, { props }).html(),
    },
  });
}

describe('Col', () => {
  it('renders as div by default', () => {
    const wrapper = mount(Col);
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('renders with span class', () => {
    const wrapper = mount(Col, { props: { span: 12 } });
    expect(wrapper.classes()).toContain('crazy-col');
    expect(wrapper.classes()).toContain('crazy-col--span-12');
  });

  it('default span is 24 (no class added)', () => {
    const wrapper = mount(Col);
    expect(wrapper.classes()).not.toContain('crazy-col--span-24');
  });

  it('applies offset class', () => {
    const wrapper = mount(Col, { props: { offset: 6 } });
    expect(wrapper.classes()).toContain('crazy-col--offset-6');
  });

  it('applies push class', () => {
    const wrapper = mount(Col, { props: { push: 4 } });
    expect(wrapper.classes()).toContain('crazy-col--push-4');
  });

  it('applies pull class', () => {
    const wrapper = mount(Col, { props: { pull: 4 } });
    expect(wrapper.classes()).toContain('crazy-col--pull-4');
  });

  it('applies responsive sm class', () => {
    const wrapper = mount(Col, { props: { sm: { span: 12, offset: 2 } } });
    expect(wrapper.classes()).toContain('crazy-col--sm-12');
    expect(wrapper.classes()).toContain('crazy-col--sm-offset-2');
  });

  it('applies responsive md class', () => {
    const wrapper = mount(Col, { props: { md: 8 } });
    expect(wrapper.classes()).toContain('crazy-col--md-8');
  });

  it('applies flex style', () => {
    const wrapper = mount(Col, { props: { flex: '1 0 auto' } });
    const el = wrapper.element as HTMLElement;
    expect(el.style.flex).toBe('1 0 auto');
  });

  it('applies numeric flex', () => {
    const wrapper = mount(Col, { props: { flex: 2 } });
    const el = wrapper.element as HTMLElement;
    expect(el.style.flex).toBeTruthy();
  });

  it('applies gutter padding from Row context', async () => {
    const rowWrapper = mount(Row, {
      props: { gutter: 20 },
      slots: {
        default: '<div class="test-child">child</div>',
      },
    });
    expect(rowWrapper.find('.crazy-row').exists()).toBe(true);
    const el = rowWrapper.element as HTMLElement;
    expect(el.style.marginLeft).toBe('-10px');
    expect(el.style.marginRight).toBe('-10px');
  });

  it('renders slot content', () => {
    const wrapper = mount(Col, {
      slots: { default: '<span class="item">Item</span>' },
    });
    expect(wrapper.find('.item').exists()).toBe(true);
  });

  it('renders custom tag', () => {
    const wrapper = mount(Col, { props: { tag: 'li' } });
    expect(wrapper.element.tagName).toBe('LI');
  });
});
