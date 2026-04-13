import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{r as n}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function r({label:e,checked:t,onChange:F,disabled:h=!1,indeterminate:m=!1,id:R,invalid:k=!1}){const M=n.useId(),b=R??M,u=n.useRef(null);n.useEffect(()=>{u.current&&(u.current.indeterminate=m)},[m]);const Y=["checkbox",h?"checkbox-disabled":"",k?"checkbox-invalid":""].filter(Boolean).join(" ");return a.jsxs("span",{className:Y,children:[a.jsx("input",{ref:u,id:b,type:"checkbox",className:"checkbox-input",checked:t,disabled:h,"aria-invalid":k?"true":void 0,onChange:B=>F(B.target.checked)}),a.jsx("label",{htmlFor:b,className:"checkbox-label",children:e})]})}try{r.displayName="Checkbox",r.__docgenInfo={description:`Checkbox — single labelled checkbox.

Always renders a real native checkbox input with a label htmlFor
association. Supports indeterminate (e.g. select-all rows).`,displayName:"Checkbox",props:{label:{defaultValue:null,description:"Visible label rendered next to the checkbox",name:"label",required:!0,type:{name:"string"}},checked:{defaultValue:null,description:"Whether the checkbox is checked (controlled)",name:"checked",required:!0,type:{name:"boolean"}},onChange:{defaultValue:null,description:"Change handler — receives the next boolean state",name:"onChange",required:!0,type:{name:"(next: boolean) => void"}},disabled:{defaultValue:{value:"false"},description:"Disabled state",name:"disabled",required:!1,type:{name:"boolean"}},indeterminate:{defaultValue:{value:"false"},description:"Indeterminate state (visual only — checked still drives value)",name:"indeterminate",required:!1,type:{name:"boolean"}},id:{defaultValue:null,description:"Stable id for label association (auto-generated when omitted)",name:"id",required:!1,type:{name:"string"}},invalid:{defaultValue:{value:"false"},description:"Marks the checkbox as invalid",name:"invalid",required:!1,type:{name:"boolean"}}}}}catch{}const z={title:"Forms/Checkbox",component:r,parameters:{layout:"padded",docs:{description:{component:"Single labelled checkbox. Renders a real native checkbox input with htmlFor label association. Supports indeterminate."}}},tags:["autodocs"],argTypes:{disabled:{control:"boolean"},indeterminate:{control:"boolean"},invalid:{control:"boolean"}}},c={render:()=>{const[e,t]=n.useState(!1);return a.jsx(r,{label:"Accept terms and conditions",checked:e,onChange:t})}},s={render:()=>{const[e,t]=n.useState(!0);return a.jsx(r,{label:"Subscribe to newsletter",checked:e,onChange:t})}},o={render:()=>{const[e,t]=n.useState(!1);return a.jsx(r,{label:"Select all rows",checked:e,onChange:t,indeterminate:!0})}},d={render:()=>a.jsxs("div",{className:"stories-stack",children:[a.jsx(r,{label:"Disabled unchecked",checked:!1,onChange:()=>{},disabled:!0}),a.jsx(r,{label:"Disabled checked",checked:!0,onChange:()=>{},disabled:!0})]})},l={render:()=>{const[e,t]=n.useState(!1);return a.jsx(r,{label:"You must accept the terms",checked:e,onChange:t,invalid:!0})}},i={render:()=>{const[e,t]=n.useState(!0);return a.jsx(r,{label:"Accept terms and conditions",checked:e,onChange:t})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var p,f,C;c.parameters={...c.parameters,docs:{...(p=c.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox label="Accept terms and conditions" checked={checked} onChange={setChecked} />;
  }
}`,...(C=(f=c.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};var x,g,S;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox label="Subscribe to newsletter" checked={checked} onChange={setChecked} />;
  }
}`,...(S=(g=s.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var v,y,j;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox label="Select all rows" checked={checked} onChange={setChecked} indeterminate />;
  }
}`,...(j=(y=o.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var D,w,_;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Checkbox label="Disabled unchecked" checked={false} onChange={() => undefined} disabled />\r
      <Checkbox label="Disabled checked" checked onChange={() => undefined} disabled />\r
    </div>
}`,...(_=(w=d.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var I,V,q;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox label="You must accept the terms" checked={checked} onChange={setChecked} invalid />;
  }
}`,...(q=(V=l.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var A,N,E;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox label="Accept terms and conditions" checked={checked} onChange={setChecked} />;
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
}`,...(E=(N=i.parameters)==null?void 0:N.docs)==null?void 0:E.source}}};const G=["Default","Checked","Indeterminate","Disabled","Invalid","DarkMode"];export{s as Checked,i as DarkMode,c as Default,d as Disabled,o as Indeterminate,l as Invalid,G as __namedExportsOrder,z as default};
