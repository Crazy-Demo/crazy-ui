<template>
  <div class="playground">
    <header class="header">
      <h1>Crazy UI</h1>
      <p class="subtitle">Enterprise Vue 3 Component Library — 10 个组件 · 246 tests</p>
    </header>

    <nav class="toc">
      <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.label }}</a>
    </nav>

    <!-- ======================== Button ======================== -->
    <section id="button" class="section">
      <h2 class="section-title">Button 按钮</h2>
      <div v-for="variant in variants" :key="variant" style="margin-bottom: 16px;">
        <h3>variant: {{ variant }}</h3>
        <div class="row">
          <Button v-for="color in colors" :key="color" :variant="variant" :color="color" size="medium">
            {{ color }}
          </Button>
        </div>
      </div>
      <h3>States</h3>
      <div class="row">
        <Button variant="solid" color="primary" disabled>Disabled</Button>
        <Button variant="solid" color="primary" loading>Loading</Button>
        <Button variant="outline" color="danger" disabled>Disabled</Button>
        <Button variant="text" color="success" disabled>Disabled</Button>
      </div>
      <h3 style="margin-top: 12px;">Sizes</h3>
      <div class="row">
        <Button variant="solid" color="primary" size="small">Small</Button>
        <Button variant="solid" color="primary" size="medium">Medium</Button>
        <Button variant="solid" color="primary" size="large">Large</Button>
      </div>
    </section>

    <!-- ======================== Input ======================== -->
    <section id="input" class="section">
      <h2 class="section-title">Input 输入框</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <h3>Basic</h3>
          <Input v-model="inputVal" placeholder="请输入内容" clearable />
          <span class="demo-value">value: {{ inputVal || '(empty)' }}</span>
        </div>
        <div class="demo-item">
          <h3>Password</h3>
          <Input v-model="pwdVal" type="password" show-password placeholder="请输入密码" />
        </div>
        <div class="demo-item">
          <h3>Textarea</h3>
          <Input v-model="textVal" type="textarea" :maxlength="100" show-word-limit
            :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入简介" />
        </div>
        <div class="demo-item">
          <h3>Disabled / Status</h3>
          <Input v-model="dVal" disabled placeholder="Disabled" style="margin-bottom:8px" />
          <Input v-model="errVal" status="error" placeholder="Error state" />
        </div>
      </div>
    </section>

    <!-- ======================== InputNumber ======================== -->
    <section id="input-number" class="section">
      <h2 class="section-title">InputNumber 数字输入</h2>
      <div class="row" style="gap:16px;">
        <div>
          <h3>Default (step=1)</h3>
          <InputNumber v-model="numVal" :min="0" :max="100" style="width:180px" />
          <span class="demo-value">value: {{ numVal }}</span>
        </div>
        <div>
          <h3>step=0.1 · precision=1</h3>
          <InputNumber v-model="num2Val" :step="0.1" :precision="1" :min="0" :max="10" style="width:180px" />
          <span class="demo-value">value: {{ num2Val }}</span>
        </div>
        <div>
          <h3>Disabled</h3>
          <InputNumber v-model="num3Val" disabled style="width:180px" />
        </div>
      </div>
    </section>

    <!-- ======================== Select ======================== -->
    <section id="select" class="section">
      <h2 class="section-title">Select 选择器</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <h3>Single</h3>
          <Select v-model="selVal" :options="selectOptions" placeholder="请选择" clearable style="width:240px" />
          <span class="demo-value">value: {{ selVal }}</span>
        </div>
        <div class="demo-item">
          <h3>Multiple</h3>
          <Select v-model="selMultiVal" :options="selectOptions" multiple placeholder="多选" style="width:240px" />
          <span class="demo-value">value: {{ selMultiVal }}</span>
        </div>
        <div class="demo-item">
          <h3>Filterable</h3>
          <Select v-model="selFilterVal" :options="fruitOptions" filterable placeholder="搜索水果" style="width:240px" />
        </div>
      </div>
    </section>

    <!-- ======================== Checkbox ======================== -->
    <section id="checkbox" class="section">
      <h2 class="section-title">Checkbox 多选框</h2>
      <div class="row" style="gap:16px;">
        <Checkbox v-model="cbVal" label="Agree" />
        <Checkbox :model-value="true" indeterminate label="Indeterminate" />
        <Checkbox :model-value="true" disabled label="Disabled checked" />
      </div>
      <h3 style="margin-top:16px;">Group</h3>
      <CheckboxGroup v-model="cbGroupVal">
        <Checkbox label="A">Option A</Checkbox>
        <Checkbox label="B">Option B</Checkbox>
        <Checkbox label="C">Option C</Checkbox>
      </CheckboxGroup>
      <span class="demo-value">selected: {{ cbGroupVal }}</span>
    </section>

    <!-- ======================== Radio ======================== -->
    <section id="radio" class="section">
      <h2 class="section-title">Radio 单选框</h2>
      <RadioGroup v-model="radioVal">
        <Radio label="A">Option A</Radio>
        <Radio label="B">Option B</Radio>
        <Radio label="C">Option C</Radio>
      </RadioGroup>
      <h3 style="margin-top:12px;">Button Style</h3>
      <RadioGroup v-model="radioVal">
        <RadioButton label="A">A</RadioButton>
        <RadioButton label="B">B</RadioButton>
        <RadioButton label="C">C</RadioButton>
      </RadioGroup>
      <span class="demo-value">selected: {{ radioVal }}</span>
    </section>

    <!-- ======================== Switch ======================== -->
    <section id="switch" class="section">
      <h2 class="section-title">Switch 开关</h2>
      <div class="row" style="gap:16px;">
        <Switch v-model="swVal" />
        <span class="demo-value">{{ swVal ? 'ON' : 'OFF' }}</span>
        <Switch :model-value="true" disabled />
        <span class="demo-value">disabled on</span>
        <Switch :model-value="false" disabled />
        <span class="demo-value">disabled off</span>
      </div>
    </section>

    <!-- ======================== Menu ======================== -->
    <section id="menu" class="section">
      <h2 class="section-title">Menu 导航菜单</h2>
      <div style="display:flex; gap:32px;">
        <div>
          <h3>Vertical</h3>
          <div style="width:220px; border:1px solid var(--color-border); border-radius:4px; overflow:hidden;">
            <Menu v-model:active="menuActive" mode="vertical">
              <MenuItem index="home">🏠 首页</MenuItem>
              <MenuItem index="users">👥 用户管理</MenuItem>
              <SubMenu index="settings">
                <template #title>⚙️ 系统设置</template>
                <MenuItem index="profile">个人设置</MenuItem>
                <MenuItem index="security">安全设置</MenuItem>
              </SubMenu>
              <MenuItem index="about">ℹ️ 关于</MenuItem>
            </Menu>
          </div>
          <span class="demo-value">active: {{ menuActive }}</span>
        </div>
        <div>
          <h3>Horizontal</h3>
          <div style="width:400px; border:1px solid var(--color-border); border-radius:4px; overflow:hidden;">
            <Menu v-model:active="menu2Active" mode="horizontal">
              <MenuItem index="home">首页</MenuItem>
              <MenuItem index="products">产品</MenuItem>
              <SubMenu index="more">
                <template #title>更多</template>
                <MenuItem index="about">关于</MenuItem>
                <MenuItem index="contact">联系</MenuItem>
              </SubMenu>
            </Menu>
          </div>
          <span class="demo-value">active: {{ menu2Active }}</span>
        </div>
      </div>
    </section>

    <!-- ======================== Tabs ======================== -->
    <section id="tabs" class="section">
      <h2 class="section-title">Tabs 标签页</h2>
      <div style="margin-bottom:24px;">
        <h3>Line (default)</h3>
        <Tabs v-model:active="tabActive">
          <TabPane name="tab1" title="Tab 1">Content of Tab 1</TabPane>
          <TabPane name="tab2" title="Tab 2">Content of Tab 2</TabPane>
          <TabPane name="tab3" title="Tab 3">Content of Tab 3</TabPane>
        </Tabs>
      </div>
      <div>
        <h3>Card</h3>
        <Tabs v-model:active="tab2Active" type="card">
          <TabPane name="a" title="Profile">Profile content</TabPane>
          <TabPane name="b" title="Settings">Settings content</TabPane>
          <TabPane name="c" title="Billing">Billing content</TabPane>
        </Tabs>
      </div>
    </section>

    <footer class="footer">
      <p>Crazy UI — Vue 3 Enterprise Component Library</p>
      <p>10 components · 246 tests · all passing ✅</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Button, Input, InputNumber, Select,
  Checkbox, CheckboxGroup,
  Radio, RadioGroup, RadioButton,
  Switch,
  Menu, MenuItem, SubMenu,
  Tabs, TabPane,
} from '@crazy-ui/components';

// Styles
import '../../../packages/theme/src/style/index.css';
import '../../../packages/components/button/style/index.css';
import '../../../packages/components/input/style/index.css';
import '../../../packages/components/input-number/style/index.css';
import '../../../packages/components/select/style/index.css';
import '../../../packages/components/checkbox/style/index.css';
import '../../../packages/components/radio/style/index.css';
import '../../../packages/components/switch/style/index.css';
import '../../../packages/components/menu/style/index.css';
import '../../../packages/components/tabs/style/index.css';

const sections = [
  { id: 'button', label: 'Button' },
  { id: 'input', label: 'Input' },
  { id: 'input-number', label: 'InputNumber' },
  { id: 'select', label: 'Select' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio' },
  { id: 'switch', label: 'Switch' },
  { id: 'menu', label: 'Menu' },
  { id: 'tabs', label: 'Tabs' },
];

// Button
const variants = ['solid', 'outline', 'ghost', 'text'] as const;
const colors = ['primary', 'success', 'warning', 'danger'] as const;

// Input
const inputVal = ref('');
const pwdVal = ref('');
const textVal = ref('');
const dVal = ref('disabled');
const errVal = ref('error value');

// InputNumber
const numVal = ref(42);
const num2Val = ref(3.5);
const num3Val = ref(99);

// Select
const selectOptions = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
];
const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'orange', label: 'Orange' },
];
const selVal = ref('beijing');
const selMultiVal = ref(['beijing', 'shanghai']);
const selFilterVal = ref('');

// Checkbox
const cbVal = ref(true);
const cbGroupVal = ref(['A', 'B']);

// Radio
const radioVal = ref('A');

// Switch
const swVal = ref(true);

// Menu
const menuActive = ref('home');
const menu2Active = ref('home');

// Tabs
const tabActive = ref('tab1');
const tab2Active = ref('a');
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5; color: #1f1f1f;
}

.playground { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }

.header {
  text-align: center; margin-bottom: 32px; padding-bottom: 24px;
  border-bottom: 2px solid var(--color-border, #e8e8e8);
}
.header h1 { font-size: 32px; font-weight: 700; }
.subtitle { font-size: 14px; color: #8c8c8c; margin-top: 8px; }

.toc {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
  padding: 16px; background: #fff; border-radius: 8px;
  border: 1px solid var(--color-border, #e8e8e8); position: sticky; top: 8px; z-index: 10;
}
.toc a {
  padding: 4px 12px; font-size: 13px; color: var(--color-primary, #1677ff);
  text-decoration: none; border-radius: 4px; transition: background 0.2s;
}
.toc a:hover { background: var(--color-primary-bg, #e6f4ff); }

.section { margin-bottom: 40px; }
.section-title {
  font-size: 20px; margin-bottom: 16px; color: #262626;
  border-bottom: 1px solid var(--color-border, #e8e8e8); padding-bottom: 8px;
}

.demo-grid { display: flex; flex-direction: column; gap: 16px; }
.demo-item h3 { font-size: 13px; color: #8c8c8c; margin-bottom: 6px; }
.demo-value { font-size: 12px; color: #8c8c8c; margin-left: 12px; font-family: monospace; }

.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
h3 { font-size: 14px; color: #595959; margin-bottom: 8px; }

.footer {
  text-align: center; padding: 32px 0; margin-top: 48px;
  border-top: 1px solid var(--color-border, #e8e8e8); color: #8c8c8c;
}
.footer p { font-size: 13px; line-height: 1.8; }
</style>
