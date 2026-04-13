import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as G}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function a({label:l,hint:c,error:r,required:u=!1,size:P="medium",leading:p,trailing:f,className:R="",id:C,disabled:h,...L}){const $=G.useId(),s=C??$,g=`${s}-hint`,b=`${s}-error`,A=r?b:c?g:void 0,B=["form-field",`form-field-${P}`,r?"form-field-invalid":"",h?"form-field-disabled":"",R].filter(Boolean).join(" ");return e.jsxs("div",{className:B,children:[e.jsxs("label",{className:"form-field-label",htmlFor:s,children:[l,u&&e.jsx("span",{className:"form-field-required","aria-hidden":"true",children:" *"})]}),e.jsxs("div",{className:"form-field-control",children:[p&&e.jsx("span",{className:"form-field-leading",children:p}),e.jsx("input",{id:s,className:"form-field-input","aria-invalid":r?"true":void 0,"aria-describedby":A,"aria-required":u||void 0,disabled:h,...L}),f&&e.jsx("span",{className:"form-field-trailing",children:f})]}),r?e.jsx("p",{id:b,className:"form-field-error",role:"alert",children:r}):c?e.jsx("p",{id:g,className:"form-field-hint",children:c}):null]})}try{a.displayName="FormField",a.__docgenInfo={description:`FormField — composed input with label, hint, and error state.

Gold reference for the composed-component pattern. Uses design tokens
exclusively (no hex, no rgb, no named colors). Light + dark via
data-theme attribute on the root element.`,displayName:"FormField",props:{label:{defaultValue:null,description:"Field label — rendered above the input",name:"label",required:!0,type:{name:"string"}},hint:{defaultValue:null,description:"Optional hint text below the input",name:"hint",required:!1,type:{name:"string"}},error:{defaultValue:null,description:"Error message — replaces hint and sets aria-invalid",name:"error",required:!1,type:{name:"string"}},required:{defaultValue:{value:"false"},description:"Whether the field is required (adds visual indicator)",name:"required",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"medium"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},leading:{defaultValue:null,description:"Leading slot (icon, prefix)",name:"leading",required:!1,type:{name:"ReactNode"}},trailing:{defaultValue:null,description:"Trailing slot (icon, suffix)",name:"trailing",required:!1,type:{name:"ReactNode"}}}}}catch{}const U={title:"Forms/FormField",component:a,parameters:{layout:"padded",docs:{description:{component:"Composed input with label, hint, and error state. Gold reference for the composed-component pattern."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]}}},o={args:{label:"Email",placeholder:"you@example.com",hint:"We'll never share your email."}},t={args:{label:"Full name",placeholder:"Jane Doe",required:!0}},d={args:{label:"Password",type:"password",error:"Password must be at least 12 characters.",defaultValue:"short"}},i={args:{label:"Employee ID",defaultValue:"EMP-00421",disabled:!0}},n={render:()=>e.jsxs("div",{className:"stories-stack",children:[e.jsx(a,{size:"small",label:"Small",placeholder:"Compact field"}),e.jsx(a,{size:"medium",label:"Medium",placeholder:"Default field"}),e.jsx(a,{size:"large",label:"Large",placeholder:"Emphasis field"})]})},m={args:{label:"Email",placeholder:"you@example.com",hint:"We'll never share your email."},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[l=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(l,{}))]};var y,x,v;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    hint: "We'll never share your email."
  }
}`,...(v=(x=o.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var F,E,j;t.parameters={...t.parameters,docs:{...(F=t.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    label: 'Full name',
    placeholder: 'Jane Doe',
    required: true
  }
}`,...(j=(E=t.parameters)==null?void 0:E.docs)==null?void 0:j.source}}};var q,N,k;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password must be at least 12 characters.',
    defaultValue: 'short'
  }
}`,...(k=(N=d.parameters)==null?void 0:N.docs)==null?void 0:k.source}}};var S,z,D;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Employee ID',
    defaultValue: 'EMP-00421',
    disabled: true
  }
}`,...(D=(z=i.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var V,_,w;n.parameters={...n.parameters,docs:{...(V=n.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <FormField size="small" label="Small" placeholder="Compact field" />\r
      <FormField size="medium" label="Medium" placeholder="Default field" />\r
      <FormField size="large" label="Large" placeholder="Emphasis field" />\r
    </div>
}`,...(w=(_=n.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};var I,W,M;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    hint: "We'll never share your email."
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
}`,...(M=(W=m.parameters)==null?void 0:W.docs)==null?void 0:M.source}}};const H=["Default","Required","WithError","Disabled","Sizes","DarkMode"];export{m as DarkMode,o as Default,i as Disabled,t as Required,n as Sizes,d as WithError,H as __namedExportsOrder,U as default};
