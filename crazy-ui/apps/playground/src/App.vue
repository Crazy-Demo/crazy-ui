<template>
  <div class="playground">
    <h1>Crazy UI — Button</h1>

    <section v-for="variant in variants" :key="variant" class="section">
      <h2 class="section-title">variant: {{ variant }}</h2>
      <div class="grid">
        <div v-for="size in sizes" :key="size" class="card">
          <h3>size: {{ size }}</h3>
          <div class="row">
            <Button
              v-for="color in colors"
              :key="color"
              :variant="variant"
              :color="color"
              :size="size"
              @click="onClick(variant, color, size)"
            >
              {{ color }}
            </Button>
          </div>
        </div>
      </div>
      <!-- disabled / loading row -->
      <div class="states">
        <h3>States</h3>
        <div class="row">
          <Button variant="solid" color="primary" disabled>Disabled</Button>
          <Button variant="solid" color="primary" loading>Loading</Button>
          <Button variant="outline" color="danger" disabled>Disabled</Button>
          <Button variant="outline" color="danger" loading>Loading</Button>
          <Button variant="text" color="success" disabled>Disabled</Button>
          <Button variant="ghost" color="warning" disabled>Disabled</Button>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Native Type</h2>
      <div class="row">
        <form @submit.prevent="onSubmit">
          <Button native-type="submit" variant="solid" color="primary">Submit</Button>
          <Button native-type="reset" variant="outline" color="warning" style="margin-left: 8px">Reset</Button>
        </form>
      </div>
    </section>

    <section class="section log">
      <h2>Click Log</h2>
      <div v-if="logs.length === 0" class="log-empty">点击按钮查看事件</div>
      <div v-for="(msg, i) in logs" :key="i" class="log-item">{{ msg }}</div>
    </section>

    <section class="section">
      <h2 class="section-title">Input</h2>

      <h3>Basic</h3>
      <div class="row" style="max-width: 400px;">
        <Input v-model="inputValue" placeholder="请输入内容" clearable />
        <span style="margin-left: 12px; font-size: 13px; color: #8c8c8c;">value: {{ inputValue }}</span>
      </div>

      <h3 style="margin-top: 16px;">Size Variants</h3>
      <div class="row" style="max-width: 400px; flex-direction: column; gap: 8px;">
        <Input v-model="sizeValues.small" size="small" placeholder="small" />
        <Input v-model="sizeValues.medium" size="medium" placeholder="medium" />
        <Input v-model="sizeValues.large" size="large" placeholder="large" />
      </div>

      <h3 style="margin-top: 16px;">Password</h3>
      <div style="max-width: 400px;">
        <Input v-model="passwordValue" type="password" show-password placeholder="请输入密码" />
      </div>

      <h3 style="margin-top: 16px;">Textarea with word limit</h3>
      <div style="max-width: 400px;">
        <Input
          v-model="textareaValue"
          type="textarea"
          :maxlength="100"
          show-word-limit
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入简介"
        />
      </div>

      <h3 style="margin-top: 16px;">Disabled / Readonly</h3>
      <div class="row" style="max-width: 400px; gap: 8px;">
        <Input v-model="disabledValue" disabled placeholder="Disabled" />
        <Input v-model="readonlyValue" readonly placeholder="Readonly" />
      </div>

      <h3 style="margin-top: 16px;">Status</h3>
      <div class="row" style="max-width: 400px; gap: 8px;">
        <Input v-model="errorValue" status="error" placeholder="Error state" />
        <Input v-model="successValue" status="success" placeholder="Success state" />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Checkbox</h2>

      <h3>Standalone</h3>
      <div class="row">
        <Checkbox v-model="checkboxVal" label="Agree" />
        <span style="margin-left: 12px; font-size: 13px; color: #8c8c8c;">{{ checkboxVal }}</span>
      </div>
      <div class="row" style="margin-top: 8px;">
        <Checkbox :model-value="true" indeterminate label="Indeterminate" />
        <Checkbox :model-value="true" disabled label="Disabled checked" />
        <Checkbox :model-value="false" disabled label="Disabled" />
      </div>

      <h3 style="margin-top: 16px;">Group</h3>
      <CheckboxGroup v-model="checkboxGroupVal">
        <Checkbox label="A">Option A</Checkbox>
        <Checkbox label="B">Option B</Checkbox>
        <Checkbox label="C">Option C</Checkbox>
      </CheckboxGroup>
      <span style="font-size: 13px; color: #8c8c8c;">selected: {{ checkboxGroupVal }}</span>
    </section>

    <section class="section">
      <h2 class="section-title">Radio</h2>

      <h3>Group</h3>
      <RadioGroup v-model="radioVal">
        <Radio label="A">Option A</Radio>
        <Radio label="B">Option B</Radio>
        <Radio label="C">Option C</Radio>
      </RadioGroup>
      <span style="font-size: 13px; color: #8c8c8c;">selected: {{ radioVal }}</span>

      <h3 style="margin-top: 16px;">Button Style</h3>
      <RadioGroup v-model="radioVal">
        <RadioButton label="A">A</RadioButton>
        <RadioButton label="B">B</RadioButton>
        <RadioButton label="C">C</RadioButton>
      </RadioGroup>
    </section>

    <section class="section">
      <h2 class="section-title">Switch</h2>
      <div class="row" style="gap: 12px; align-items: center;">
        <Switch v-model="switchVal" />
        <span style="font-size: 14px;">{{ switchVal ? 'ON' : 'OFF' }}</span>
        <Switch v-model="switchVal" disabled style="margin-left: 16px;" />
        <span style="font-size: 13px; color: #8c8c8c;">disabled</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Checkbox, CheckboxGroup } from '@crazy-ui/components';
import { Radio, RadioGroup, RadioButton } from '@crazy-ui/components';
import { Switch } from '@crazy-ui/components';
import '../../../packages/theme/src/style/index.css';
import '../../../packages/components/button/style/index.css';
import '../../../packages/components/input/style/index.css';
import '../../../packages/components/checkbox/style/index.css';
import '../../../packages/components/radio/style/index.css';
import '../../../packages/components/switch/style/index.css';

const variants = ['solid', 'outline', 'ghost', 'text'] as const;
const colors = ['primary', 'success', 'warning', 'danger'] as const;
const sizes = ['small', 'medium', 'large'] as const;

const logs = ref<string[]>([]);

const inputValue = ref('');
const sizeValues = ref({ small: '', medium: '', large: '' });
const passwordValue = ref('');
const textareaValue = ref('');
const disabledValue = ref('disabled value');
const readonlyValue = ref('readonly value');
const errorValue = ref('error value');
const successValue = ref('success value');

const checkboxVal = ref(true);
const checkboxGroupVal = ref<string[]>(['A', 'B']);
const radioVal = ref('A');
const switchVal = ref(true);

function onClick(variant: string, color: string, size: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${variant} + ${color} + ${size}`);
  if (logs.value.length > 20) logs.value.pop();
}

function onSubmit() {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] form submit triggered`);
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #1f1f1f; }

.playground { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
h1 { font-size: 28px; margin-bottom: 32px; }

.section { margin-bottom: 40px; }
.section-title { font-size: 18px; margin-bottom: 16px; color: #595959; border-bottom: 1px solid #e8e8e8; padding-bottom: 8px; }
.grid { display: flex; flex-direction: column; gap: 16px; }

.card h3 { font-size: 13px; color: #8c8c8c; margin-bottom: 8px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.states { margin-top: 16px; }
.states h3 { font-size: 13px; color: #8c8c8c; margin-bottom: 8px; }

.log { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 16px; max-height: 300px; overflow-y: auto; }
.log-empty { color: #bfbfbf; font-size: 14px; }
.log-item { font-size: 13px; color: #434343; padding: 2px 0; font-family: monospace; }
</style>
