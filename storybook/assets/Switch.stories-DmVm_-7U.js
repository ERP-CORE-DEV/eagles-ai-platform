import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{r}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function s({checked:e,defaultChecked:t,onChange:u,disabled:p=!1,label:h,size:z="medium",id:I,"aria-label":A}){const R=r.useId(),k=I??R,[F,M]=r.useState(t??!1),b=e!==void 0,m=b?e:F,O=c=>{b||M(c),u==null||u(c)},T=["switch",`switch-${z}`,m?"switch-checked":"",p?"switch-disabled":""].filter(Boolean).join(" ");return a.jsxs("span",{className:T,children:[a.jsx("input",{id:k,type:"checkbox",role:"switch",className:"switch-input",checked:m,disabled:p,"aria-label":h?void 0:A,"aria-checked":m,onChange:c=>O(c.target.checked)}),a.jsx("span",{className:"switch-track","aria-hidden":"true",children:a.jsx("span",{className:"switch-thumb"})}),h&&a.jsx("label",{htmlFor:k,className:"switch-label",children:h})]})}try{s.displayName="Switch",s.__docgenInfo={description:'Switch — toggle switch with custom track + thumb styling.\n\nRenders a real native checkbox input with role="switch" for accessibility.\nSupports controlled (checked + onChange) and uncontrolled (defaultChecked)\nusage. Provide either `label` or `aria-label`.',displayName:"Switch",props:{checked:{defaultValue:null,description:"Checked state (controlled)",name:"checked",required:!1,type:{name:"boolean"}},defaultChecked:{defaultValue:null,description:"Initial checked state (uncontrolled)",name:"defaultChecked",required:!1,type:{name:"boolean"}},onChange:{defaultValue:null,description:"Change handler — receives the next boolean state",name:"onChange",required:!1,type:{name:"((checked: boolean) => void)"}},disabled:{defaultValue:{value:"false"},description:"Disabled state",name:"disabled",required:!1,type:{name:"boolean"}},label:{defaultValue:null,description:"Visible label rendered next to the switch",name:"label",required:!1,type:{name:"string"}},size:{defaultValue:{value:"medium"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'}]}},id:{defaultValue:null,description:"Stable id for label association (auto-generated when omitted)",name:"id",required:!1,type:{name:"string"}},"aria-label":{defaultValue:null,description:"Optional accessible label when no visible label is provided",name:"aria-label",required:!1,type:{name:"string"}}}}}catch{}const G={title:"Forms/Switch",component:s,parameters:{layout:"padded",docs:{description:{component:'Toggle switch with custom track + thumb styling. Renders a real native checkbox with role="switch" for accessibility.'}}},tags:["autodocs"],argTypes:{disabled:{control:"boolean"},size:{control:"radio",options:["small","medium"]}}},n={render:()=>{const[e,t]=r.useState(!1);return a.jsx(s,{label:"Enable notifications",checked:e,onChange:t})}},d={render:()=>{const[e,t]=r.useState(!0);return a.jsx(s,{label:"Auto-save drafts",checked:e,onChange:t})}},o={render:()=>{const[e,t]=r.useState(!0);return a.jsx(s,{label:"Compact mode",checked:e,onChange:t,size:"small"})}},l={render:()=>a.jsxs("div",{className:"stories-stack",children:[a.jsx(s,{label:"Disabled off",checked:!1,onChange:()=>{},disabled:!0}),a.jsx(s,{label:"Disabled on",checked:!0,onChange:()=>{},disabled:!0})]})},i={render:()=>{const[e,t]=r.useState(!0);return a.jsx(s,{label:"Enable notifications",checked:e,onChange:t})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var f,C,g;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch label="Enable notifications" checked={checked} onChange={setChecked} />;
  }
}`,...(g=(C=n.parameters)==null?void 0:C.docs)==null?void 0:g.source}}};var w,S,y;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Auto-save drafts" checked={checked} onChange={setChecked} />;
  }
}`,...(y=(S=d.parameters)==null?void 0:S.docs)==null?void 0:y.source}}};var v,x,j;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Compact mode" checked={checked} onChange={setChecked} size="small" />;
  }
}`,...(j=(x=o.parameters)==null?void 0:x.docs)==null?void 0:j.source}}};var D,_,E;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Switch label="Disabled off" checked={false} onChange={() => undefined} disabled />\r
      <Switch label="Disabled on" checked onChange={() => undefined} disabled />\r
    </div>
}`,...(E=(_=l.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var N,V,q;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Enable notifications" checked={checked} onChange={setChecked} />;
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
}`,...(q=(V=i.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};const H=["Default","Checked","Small","Disabled","DarkMode"];export{d as Checked,i as DarkMode,n as Default,l as Disabled,o as Small,H as __namedExportsOrder,G as default};
