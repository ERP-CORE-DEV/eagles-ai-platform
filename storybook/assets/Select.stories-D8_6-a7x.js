import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as L}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function t({options:r,value:u,onChange:m,placeholder:p,invalid:g=!1,size:v="medium",className:q="",id:D,name:P,disabled:w,...M}){const F=["select",`select-${v}`,g?"select-invalid":"",q].filter(Boolean).join(" ");return e.jsxs("div",{className:`select-wrapper select-wrapper-${v}`,children:[e.jsxs("select",{id:D,name:P,className:F,value:u??"",onChange:n=>m(n.target.value),"aria-invalid":g?"true":void 0,disabled:w,...M,children:[p&&e.jsx("option",{value:"",disabled:!0,children:p}),r.map(n=>e.jsx("option",{value:n.value,disabled:n.disabled,children:n.label},n.value))]}),e.jsx("span",{className:"select-chevron","aria-hidden":"true",children:e.jsx("svg",{viewBox:"0 0 20 20",width:"16",height:"16",fill:"none",children:e.jsx("path",{d:"M5 8l5 5 5-5",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})})]})}try{t.displayName="Select",t.__docgenInfo={description:"Select — native <select> wrapper.\n\nHas no built-in label. Consumers must provide either an `aria-label`\nor wrap the select in a FormField using the same `id`.",displayName:"Select",props:{options:{defaultValue:null,description:"Options to render",name:"options",required:!0,type:{name:"SelectOption[]"}},value:{defaultValue:null,description:"Currently selected value (controlled)",name:"value",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"Change handler — receives the new value directly",name:"onChange",required:!0,type:{name:"(value: string) => void"}},placeholder:{defaultValue:null,description:"Placeholder option label (renders a disabled empty option)",name:"placeholder",required:!1,type:{name:"string"}},invalid:{defaultValue:{value:"false"},description:"Marks the select as invalid (sets aria-invalid + error border)",name:"invalid",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"medium"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},id:{defaultValue:null,description:"Required: stable id for label association",name:"id",required:!0,type:{name:"string"}},name:{defaultValue:null,description:"Required: form field name",name:"name",required:!0,type:{name:"string"}}}}}catch{}const $={title:"Forms/Select",component:t,parameters:{layout:"padded",docs:{description:{component:"Native <select> wrapper. Wrap in FormField for label, or pass `aria-label` directly."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]},invalid:{control:"boolean"},disabled:{control:"boolean"}}},a=[{value:"cdi",label:"CDI"},{value:"cdd",label:"CDD"},{value:"cdic",label:"CDIC"},{value:"freelance",label:"Freelance"},{value:"interim",label:"Intérim"}],l={args:{id:"select-contract-default",name:"contract","aria-label":"Contract type",options:a,placeholder:"Select a contract type…",onChange:()=>{}}},o={render:r=>{const[u,m]=L.useState("cdi");return e.jsx(t,{...r,id:"select-contract-controlled",name:"contract","aria-label":"Contract type",options:a,value:u,onChange:m})}},s={args:{id:"select-contract-invalid",name:"contract","aria-label":"Contract type",options:a,placeholder:"Select a contract type…",invalid:!0,onChange:()=>{}}},i={args:{id:"select-contract-disabled",name:"contract","aria-label":"Contract type",options:a,value:"cdi",disabled:!0,onChange:()=>{}}},c={render:()=>e.jsxs("div",{className:"stories-stack",children:[e.jsx(t,{id:"select-size-small",name:"size-small","aria-label":"Small select",size:"small",options:a,placeholder:"Small",onChange:()=>{}}),e.jsx(t,{id:"select-size-medium",name:"size-medium","aria-label":"Medium select",size:"medium",options:a,placeholder:"Medium",onChange:()=>{}}),e.jsx(t,{id:"select-size-large",name:"size-large","aria-label":"Large select",size:"large",options:a,placeholder:"Large",onChange:()=>{}})]})},d={args:{id:"select-contract-dark",name:"contract","aria-label":"Contract type",options:a,placeholder:"Select a contract type…",onChange:()=>{}},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[r=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(r,{}))]};var h,C,b;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    id: 'select-contract-default',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    onChange: () => undefined
  }
}`,...(b=(C=l.parameters)==null?void 0:C.docs)==null?void 0:b.source}}};var f,S,y;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('cdi');
    return <Select {...args} id="select-contract-controlled" name="contract" aria-label="Contract type" options={CONTRACT_OPTIONS} value={value} onChange={setValue} />;
  }
}`,...(y=(S=o.parameters)==null?void 0:S.docs)==null?void 0:y.source}}};var O,T,N;s.parameters={...s.parameters,docs:{...(O=s.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    id: 'select-contract-invalid',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    invalid: true,
    onChange: () => undefined
  }
}`,...(N=(T=s.parameters)==null?void 0:T.docs)==null?void 0:N.source}}};var z,k,x;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    id: 'select-contract-disabled',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    value: 'cdi',
    disabled: true,
    onChange: () => undefined
  }
}`,...(x=(k=i.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var _,j,I;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Select id="select-size-small" name="size-small" aria-label="Small select" size="small" options={CONTRACT_OPTIONS} placeholder="Small" onChange={() => undefined} />\r
      <Select id="select-size-medium" name="size-medium" aria-label="Medium select" size="medium" options={CONTRACT_OPTIONS} placeholder="Medium" onChange={() => undefined} />\r
      <Select id="select-size-large" name="size-large" aria-label="Large select" size="large" options={CONTRACT_OPTIONS} placeholder="Large" onChange={() => undefined} />\r
    </div>
}`,...(I=(j=c.parameters)==null?void 0:j.docs)==null?void 0:I.source}}};var R,A,V;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    id: 'select-contract-dark',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    onChange: () => undefined
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    theme: 'dark'
  },
  decorators: [Story => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    return <Story />;
  }]
}`,...(V=(A=d.parameters)==null?void 0:A.docs)==null?void 0:V.source}}};const H=["Default","Controlled","Invalid","Disabled","Sizes","DarkMode"];export{o as Controlled,d as DarkMode,l as Default,i as Disabled,s as Invalid,c as Sizes,H as __namedExportsOrder,$ as default};
