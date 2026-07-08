<template>
  <div class="playground">
    <header class="header">
      <h1>Crazy UI</h1>
      <p class="subtitle">Enterprise Vue 3 Component Library — 44 组件 · 638 tests</p>
    </header>

    <nav class="toc">
      <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.label }}</a>
    </nav>

    <!-- ======================== Button ======================== -->
    <section id="button" class="section"><h2 class="section-title">Button</h2>
      <div v-for="v in variants" :key="v" style="margin-bottom:12px">
        <h3>variant: {{ v }}</h3>
        <div class="row"><Button v-for="c in colors" :key="c" :variant="v" :color="c">{{ c }}</Button></div>
      </div>
      <h3>States</h3>
      <div class="row"><Button disabled>Disabled</Button><Button loading>Loading</Button><Button variant="outline" color="danger" disabled>Disabled</Button></div>
    </section>

    <!-- ======================== Input ======================== -->
    <section id="input" class="section"><h2 class="section-title">Input</h2>
      <div class="demo-grid">
        <div class="demo-item"><h3>Basic</h3><Input v-model="inputVal" placeholder="请输入" clearable /><span class="demo-value">{{ inputVal || '(empty)' }}</span></div>
        <div class="demo-item"><h3>Password</h3><Input v-model="pwdVal" type="password" show-password placeholder="密码" /></div>
        <div class="demo-item"><h3>Textarea</h3><Input v-model="textVal" type="textarea" :maxlength="100" show-word-limit :autosize="{minRows:2,maxRows:4}" /></div>
      </div>
    </section>

    <!-- ======================== InputNumber ======================== -->
    <section id="input-number" class="section"><h2 class="section-title">InputNumber</h2>
      <div class="row"><InputNumber v-model="numVal" :min="0" :max="100" style="width:180px" /><span class="demo-value">value: {{ numVal }}</span></div>
    </section>

    <!-- ======================== Select ======================== -->
    <section id="select" class="section"><h2 class="section-title">Select</h2>
      <Select v-model="selVal" :options="selectOptions" placeholder="请选择" clearable style="width:240px" />
      <Select v-model="selMultiVal" :options="selectOptions" multiple placeholder="多选" style="width:240px;margin-left:12px" />
    </section>

    <!-- ======================== Checkbox ======================== -->
    <section id="checkbox" class="section"><h2 class="section-title">Checkbox</h2>
      <div class="row"><Checkbox v-model="cbVal" label="Agree" /><Checkbox :model-value="true" indeterminate label="Indeterminate" /></div>
      <CheckboxGroup v-model="cbGroupVal" style="margin-top:8px"><Checkbox label="A">A</Checkbox><Checkbox label="B">B</Checkbox><Checkbox label="C">C</Checkbox></CheckboxGroup>
    </section>

    <!-- ======================== Radio ======================== -->
    <section id="radio" class="section"><h2 class="section-title">Radio</h2>
      <RadioGroup v-model="radioVal"><Radio label="A">A</Radio><Radio label="B">B</Radio><Radio label="C">C</Radio></RadioGroup>
      <RadioGroup v-model="radioVal" style="margin-top:8px"><RadioButton label="A">A</RadioButton><RadioButton label="B">B</RadioButton><RadioButton label="C">C</RadioButton></RadioGroup>
    </section>

    <!-- ======================== Switch ======================== -->
    <section id="switch" class="section"><h2 class="section-title">Switch</h2>
      <div class="row"><Switch v-model="swVal" /><span class="demo-value">{{ swVal?'ON':'OFF' }}</span><Switch :model-value="true" disabled /></div>
    </section>

    <!-- ======================== Progress ======================== -->
    <section id="progress" class="section"><h2 class="section-title">Progress</h2>
      <div style="max-width:400px"><Progress :percentage="70" /><Progress :percentage="100" status="success" /><Progress :percentage="30" status="exception" /></div>
    </section>

    <!-- ======================== Loading ======================== -->
    <section id="loading" class="section"><h2 class="section-title">Loading</h2>
      <div class="row"><Loading :loading="true" text="加载中..." style="display:inline-flex" /></div>
    </section>

    <!-- ======================== Rate ======================== -->
    <section id="rate" class="section"><h2 class="section-title">Rate</h2>
      <Rate v-model="rateVal" /><span class="demo-value">value: {{ rateVal }}</span>
    </section>

    <!-- ======================== Tag ======================== -->
    <section id="tag" class="section"><h2 class="section-title">Tag</h2>
      <div class="row"><Tag type="primary">primary</Tag><Tag type="success">success</Tag><Tag type="warning">warning</Tag><Tag type="danger">danger</Tag><Tag closable>closable</Tag></div>
    </section>

    <!-- ======================== Badge ======================== -->
    <section id="badge" class="section"><h2 class="section-title">Badge</h2>
      <div class="row"><Badge :value="5"><Button>新消息</Button></Badge><Badge is-dot><Button>通知</Button></Badge></div>
    </section>

    <!-- ======================== Avatar ======================== -->
    <section id="avatar" class="section"><h2 class="section-title">Avatar ⭐</h2>
      <div class="row"><Avatar alt="U" /><Avatar src="" alt="XM" /><Avatar shape="square" alt="SQ" /></div>
    </section>

    <!-- ======================== Alert ======================== -->
    <section id="alert" class="section"><h2 class="section-title">Alert ⭐</h2>
      <div style="max-width:600px"><Alert title="成功提示" type="success" description="操作已成功完成" /><Alert title="警告提示" type="warning" description="请注意检查配置" style="margin-top:8px" /><Alert title="错误提示" type="error" style="margin-top:8px" /></div>
    </section>

    <!-- ======================== Empty ======================== -->
    <section id="empty" class="section"><h2 class="section-title">Empty ⭐</h2>
      <Empty description="自定义空状态文案" />
    </section>

    <!-- ======================== Skeleton ======================== -->
    <section id="skeleton" class="section"><h2 class="section-title">Skeleton ⭐</h2>
      <Skeleton :loading="true" :rows="2" animated />
    </section>

    <!-- ======================== Grid ======================== -->
    <section id="grid" class="section"><h2 class="section-title">Grid Row + Col ⭐</h2>
      <Row :gutter="16">
        <Col :span="8"><div class="grid-demo-box">span=8</div></Col>
        <Col :span="8"><div class="grid-demo-box">span=8</div></Col>
        <Col :span="8"><div class="grid-demo-box">span=8</div></Col>
      </Row>
    </section>

    <!-- ======================== Layout ======================== -->
    <section id="layout" class="section"><h2 class="section-title">Layout ⭐</h2>
      <div style="height:200px;border:1px solid var(--color-border);border-radius:4px;overflow:hidden">
        <Layout><Header style="background:#409eff;color:#fff;display:flex;align-items:center;padding:0 16px">Header</Header>
          <Layout>
            <Sider width="150px" style="background:#e6f0ff;display:flex;align-items:center;justify-content:center">Sider</Sider>
            <Content style="display:flex;align-items:center;justify-content:center;background:#fff">Content</Content>
          </Layout>
          <Footer style="background:#f5f5f5;display:flex;align-items:center;justify-content:center">Footer</Footer>
        </Layout>
      </div>
    </section>

    <!-- ======================== Table ======================== -->
    <section id="table" class="section"><h2 class="section-title">Table ⭐</h2>
      <Table :data="tableData" :columns="tableColumns" bordered stripe />
    </section>

    <!-- ======================== Menu ======================== -->
    <section id="menu" class="section"><h2 class="section-title">Menu</h2>
      <div style="width:220px;border:1px solid var(--color-border);border-radius:4px">
        <Menu v-model:active="menuActive" mode="vertical">
          <MenuItem index="home">🏠 首页</MenuItem>
          <SubMenu index="settings"><template #title>⚙️ 设置</template><MenuItem index="profile">个人</MenuItem><MenuItem index="security">安全</MenuItem></SubMenu>
        </Menu>
      </div>
    </section>

    <!-- ======================== Tabs ======================== -->
    <section id="tabs" class="section"><h2 class="section-title">Tabs</h2>
      <Tabs v-model:active="tabActive"><TabPane name="t1" title="Tab 1">Content 1</TabPane><TabPane name="t2" title="Tab 2">Content 2</TabPane></Tabs>
    </section>

    <!-- ======================== Dialog ======================== -->
    <section id="dialog" class="section"><h2 class="section-title">Dialog</h2>
      <Button @click="showDialog=true">Open Dialog</Button>
      <Dialog v-model="showDialog" title="确认操作"><p>确定要执行此操作吗？</p></Dialog>
    </section>

    <!-- ======================== Form ======================== -->
    <section id="form" class="section"><h2 class="section-title">Form</h2>
      <div style="max-width:480px">
        <Form ref="formRef" :model="formModel" :rules="formRules" label-width="80px">
          <FormItem label="用户名" prop="username"><Input v-model="formModel.username" /></FormItem>
          <FormItem label="密码" prop="password"><Input v-model="formModel.password" type="password" show-password /></FormItem>
          <FormItem label="城市" prop="city"><Select v-model="formModel.city" :options="cityOptions" style="width:100%" /></FormItem>
          <FormItem><Button native-type="submit" variant="solid" color="primary">Submit</Button></FormItem>
        </Form>
      </div>
    </section>

    <!-- ======================== Breadcrumb | Divider | Space ======================== -->
    <section id="others" class="section"><h2 class="section-title">Breadcrumb · Divider · Space · Steps · Pagination</h2>
      <Breadcrumb><BreadcrumbItem>Home</BreadcrumbItem><BreadcrumbItem>Products</BreadcrumbItem><BreadcrumbItem>Detail</BreadcrumbItem></Breadcrumb>
      <Divider />
      <div style="display:flex;align-items:center;gap:8px"><span>Left</span><Divider direction="vertical" /><span>Right</span></div>
      <Space :size="16" style="margin-top:12px"><Tag>Tag1</Tag><Tag type="success">Tag2</Tag><Button size="small">Btn</Button></Space>
      <Steps :active="1" style="margin-top:16px"><Step title="Step 1" /><Step title="Step 2" /><Step title="Step 3" /></Steps>
      <Pagination :total="100" style="margin-top:16px" />
    </section>

    <footer class="footer">
      <p>Crazy UI — Vue 3 Enterprise Component Library</p>
      <p>44 components · 638 tests · all passing ✅</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Button, Input, InputNumber, Select,
  Checkbox, CheckboxGroup, Radio, RadioGroup, RadioButton,
  Switch, Progress, Loading, Rate, Tag, Badge,
  Avatar, Empty, Alert, Skeleton, Row, Col,
  Layout, Header, Footer, Sider, Content,
  Table, Menu, MenuItem, SubMenu, Tabs, TabPane,
  Dialog, Form, FormItem, Breadcrumb, BreadcrumbItem,
  Divider, Space, Steps, Step, Pagination, Card, Collapse, CollapseItem,
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
import '../../../packages/components/progress/style/index.css';
import '../../../packages/components/loading/style/index.css';
import '../../../packages/components/rate/style/index.css';
import '../../../packages/components/tag/style/index.css';
import '../../../packages/components/badge/style/index.css';
import '../../../packages/components/avatar/style/index.css';
import '../../../packages/components/empty/style/index.css';
import '../../../packages/components/alert/style/index.css';
import '../../../packages/components/skeleton/style/index.css';
import '../../../packages/components/row/style/index.css';
import '../../../packages/components/col/style/index.css';
import '../../../packages/components/layout/style/index.css';
import '../../../packages/components/table/style/index.css';
import '../../../packages/components/menu/style/index.css';
import '../../../packages/components/tabs/style/index.css';
import '../../../packages/components/dialog/style/index.css';
import '../../../packages/components/form/style/index.css';
import '../../../packages/components/breadcrumb/style/index.css';
import '../../../packages/components/divider/style/index.css';
import '../../../packages/components/space/style/index.css';
import '../../../packages/components/steps/style/index.css';
import '../../../packages/components/pagination/style/index.css';
import '../../../packages/components/card/style/index.css';
import '../../../packages/components/collapse/style/index.css';

const sections = [
  {id:'button',label:'Button'},{id:'input',label:'Input'},{id:'input-number',label:'InputNumber'},
  {id:'select',label:'Select'},{id:'checkbox',label:'Checkbox'},{id:'radio',label:'Radio'},
  {id:'switch',label:'Switch'},{id:'progress',label:'Progress'},{id:'loading',label:'Loading'},
  {id:'rate',label:'Rate'},{id:'tag',label:'Tag'},{id:'badge',label:'Badge'},
  {id:'avatar',label:'Avatar⭐'},{id:'alert',label:'Alert⭐'},{id:'empty',label:'Empty⭐'},
  {id:'skeleton',label:'Skeleton⭐'},{id:'grid',label:'Grid⭐'},{id:'layout',label:'Layout⭐'},
  {id:'table',label:'Table⭐'},{id:'menu',label:'Menu'},{id:'tabs',label:'Tabs'},
  {id:'dialog',label:'Dialog'},{id:'form',label:'Form'},{id:'others',label:'Others'},
];

const variants = ['solid','outline','ghost','text'] as const;
const colors = ['primary','success','warning','danger'] as const;
const inputVal=ref(''),pwdVal=ref(''),textVal=ref('');
const numVal=ref(42),selVal=ref('beijing'),selMultiVal=ref(['beijing','shanghai']);
const cbVal=ref(true),cbGroupVal=ref(['A','B']),radioVal=ref('A'),swVal=ref(true);
const rateVal=ref(3),menuActive=ref('home'),tabActive=ref('t1'),showDialog=ref(false);
const selectOptions=[{value:'beijing',label:'北京'},{value:'shanghai',label:'上海'},{value:'shenzhen',label:'深圳'}];
const cityOptions=selectOptions;
const tableData=[{id:1,name:'Alice',age:28},{id:2,name:'Bob',age:35},{id:3,name:'Charlie',age:42}];
const tableColumns=[{dataIndex:'name',title:'Name',key:'name'},{dataIndex:'age',title:'Age',key:'age',sortable:true}];
const formRef=ref<any>(null);
const formModel=ref({username:'',password:'',city:''});
const formRules={username:[{required:true,message:'请输入'}],password:[{required:true,message:'请输入'},{min:6,message:'至少6位'}],city:[{required:true,message:'请选择'}]};
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#1f1f1f}
.playground{max-width:960px;margin:0 auto;padding:40px 24px 80px}
.header{text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid var(--color-border,#e8e8e8)}
.header h1{font-size:32px;font-weight:700}
.subtitle{font-size:14px;color:#8c8c8c;margin-top:8px}
.toc{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:32px;padding:12px 16px;background:#fff;border-radius:8px;border:1px solid var(--color-border,#e8e8e8);position:sticky;top:8px;z-index:10}
.toc a{padding:3px 10px;font-size:12px;color:var(--color-primary,#1677ff);text-decoration:none;border-radius:4px}
.toc a:hover{background:var(--color-primary-bg,#e6f4ff)}
.section{margin-bottom:36px}
.section-title{font-size:20px;margin-bottom:14px;color:#262626;border-bottom:1px solid var(--color-border,#e8e8e8);padding-bottom:8px}
.demo-grid{display:flex;flex-direction:column;gap:12px}
.demo-item h3{font-size:13px;color:#8c8c8c;margin-bottom:6px}
.demo-value{font-size:12px;color:#8c8c8c;margin-left:12px;font-family:monospace}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
h3{font-size:14px;color:#595959;margin-bottom:8px}
.grid-demo-box{background:var(--color-primary-bg,#e6f0ff);border:1px solid var(--color-primary-border,#b3d4ff);border-radius:4px;padding:12px;text-align:center;font-size:13px;color:var(--color-primary,#1677ff)}
.footer{text-align:center;padding:32px 0;margin-top:48px;border-top:1px solid var(--color-border,#e8e8e8);color:#8c8c8c}
.footer p{font-size:13px;line-height:1.8}
</style>
