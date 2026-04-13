import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as t}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const w=t.createContext(null);function o({name:a,value:l,defaultValue:i,onChange:d,orientation:b="vertical","aria-label":s,"aria-labelledby":n,children:v}){const[f,I]=t.useState(i??""),h=l!==void 0,F=h?l:f,N=y=>{h||I(y),d==null||d(y)};return e.jsx(w.Provider,{value:{name:a,value:F,onSelect:N},children:e.jsx("div",{className:`radio-group radio-group-${b}`,role:"radiogroup","aria-label":s,"aria-labelledby":n,children:v})})}function r({value:a,label:l,disabled:i=!1,id:d}){const b=t.useId(),s=d??b,n=t.useContext(w);if(!n)throw new Error("Radio must be rendered inside a RadioGroup");const v=n.value===a,f=["radio",i?"radio-disabled":""].filter(Boolean).join(" ");return e.jsxs("span",{className:f,children:[e.jsx("input",{id:s,type:"radio",className:"radio-input",name:n.name,value:a,checked:v,disabled:i,onChange:()=>n.onSelect(a)}),e.jsx("label",{htmlFor:s,className:"radio-label",children:l})]})}try{o.displayName="RadioGroup",o.__docgenInfo={description:'RadioGroup — wrapper that manages name + selected value for nested Radios.\n\nSupports controlled (value + onChange) and uncontrolled (defaultValue) usage.\nRenders a `role="radiogroup"` container; consumers should pass an\n`aria-label` or `aria-labelledby`.',displayName:"RadioGroup",props:{name:{defaultValue:null,description:"Form field name shared by all radios in the group",name:"name",required:!0,type:{name:"string"}},value:{defaultValue:null,description:"Currently selected value (controlled)",name:"value",required:!1,type:{name:"string"}},defaultValue:{defaultValue:null,description:"Initial selected value (uncontrolled)",name:"defaultValue",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"Change handler — receives the newly selected value",name:"onChange",required:!1,type:{name:"((value: string) => void)"}},orientation:{defaultValue:{value:"vertical"},description:"Layout orientation",name:"orientation",required:!1,type:{name:"enum",value:[{value:'"horizontal"'},{value:'"vertical"'}]}},"aria-label":{defaultValue:null,description:"Optional accessible label for the group",name:"aria-label",required:!1,type:{name:"string"}},"aria-labelledby":{defaultValue:null,description:"Optional id of an external element labelling the group",name:"aria-labelledby",required:!1,type:{name:"string"}},children:{defaultValue:null,description:"Radio children",name:"children",required:!0,type:{name:"ReactNode"}}}}}catch{}try{r.displayName="Radio",r.__docgenInfo={description:`Radio — single radio button. Must be rendered inside a RadioGroup.

Renders a real native radio input with a label \`htmlFor\` association.
Selection state is read from the surrounding RadioGroup.`,displayName:"Radio",props:{value:{defaultValue:null,description:"Value submitted when this radio is selected",name:"value",required:!0,type:{name:"string"}},label:{defaultValue:null,description:"Visible label",name:"label",required:!0,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disabled state",name:"disabled",required:!1,type:{name:"boolean"}},id:{defaultValue:null,description:"Stable id for label association (auto-generated when omitted)",name:"id",required:!1,type:{name:"string"}}}}}catch{}const A={title:"Forms/Radio",component:o,parameters:{layout:"padded",docs:{description:{component:"Radio + RadioGroup. RadioGroup manages name + selected value; Radio renders a real native radio input with htmlFor label association."}}},tags:["autodocs"]},u={render:()=>{const[a,l]=t.useState("cdi");return e.jsxs(o,{name:"contract-type",value:a,onChange:l,"aria-label":"Contract type",children:[e.jsx(r,{value:"cdi",label:"CDI — permanent"}),e.jsx(r,{value:"cdd",label:"CDD — fixed term"}),e.jsx(r,{value:"freelance",label:"Freelance"})]})}},c={render:()=>{const[a,l]=t.useState("remote");return e.jsxs(o,{name:"work-mode",value:a,onChange:l,orientation:"horizontal","aria-label":"Work mode",children:[e.jsx(r,{value:"remote",label:"Remote"}),e.jsx(r,{value:"hybrid",label:"Hybrid"}),e.jsx(r,{value:"onsite",label:"On-site"})]})}},p={render:()=>e.jsxs(o,{name:"status",defaultValue:"active","aria-label":"Status",children:[e.jsx(r,{value:"active",label:"Active"}),e.jsx(r,{value:"paused",label:"Paused",disabled:!0}),e.jsx(r,{value:"closed",label:"Closed",disabled:!0})]})},m={render:()=>{const[a,l]=t.useState("cdi");return e.jsxs(o,{name:"contract-type-dark",value:a,onChange:l,"aria-label":"Contract type",children:[e.jsx(r,{value:"cdi",label:"CDI — permanent"}),e.jsx(r,{value:"cdd",label:"CDD — fixed term"}),e.jsx(r,{value:"freelance",label:"Freelance"})]})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var R,g,x;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('cdi');
    return <RadioGroup name="contract-type" value={value} onChange={setValue} aria-label="Contract type">\r
        <Radio value="cdi" label="CDI — permanent" />\r
        <Radio value="cdd" label="CDD — fixed term" />\r
        <Radio value="freelance" label="Freelance" />\r
      </RadioGroup>;
  }
}`,...(x=(g=u.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var V,C,j;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('remote');
    return <RadioGroup name="work-mode" value={value} onChange={setValue} orientation="horizontal" aria-label="Work mode">\r
        <Radio value="remote" label="Remote" />\r
        <Radio value="hybrid" label="Hybrid" />\r
        <Radio value="onsite" label="On-site" />\r
      </RadioGroup>;
  }
}`,...(j=(C=c.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var S,D,G;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <RadioGroup name="status" defaultValue="active" aria-label="Status">\r
      <Radio value="active" label="Active" />\r
      <Radio value="paused" label="Paused" disabled />\r
      <Radio value="closed" label="Closed" disabled />\r
    </RadioGroup>
}`,...(G=(D=p.parameters)==null?void 0:D.docs)==null?void 0:G.source}}};var _,k,q;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('cdi');
    return <RadioGroup name="contract-type-dark" value={value} onChange={setValue} aria-label="Contract type">\r
        <Radio value="cdi" label="CDI — permanent" />\r
        <Radio value="cdd" label="CDD — fixed term" />\r
        <Radio value="freelance" label="Freelance" />\r
      </RadioGroup>;
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
}`,...(q=(k=m.parameters)==null?void 0:k.docs)==null?void 0:q.source}}};const H=["Default","Horizontal","Disabled","DarkMode"];export{m as DarkMode,u as Default,p as Disabled,c as Horizontal,H as __namedExportsOrder,A as default};
