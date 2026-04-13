import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function a({size:r="medium",invalid:s=!1,className:I="",type:z="text",id:_,"aria-label":j,"aria-labelledby":M,...D}){const F=["input",`input-${r}`,s?"input-invalid":"",I].filter(Boolean).join(" ");return e.jsx("input",{id:_,type:z,className:F,"aria-invalid":s?"true":void 0,"aria-label":j,"aria-labelledby":M,...D})}try{a.displayName="Input",a.__docgenInfo={description:"Input — standalone text input.\n\nHas no built-in label. Consumers must provide either an `aria-label`\nor wrap this component in a FormField (which renders the `<label htmlFor>`).\nForwards all native input props.",displayName:"Input",props:{size:{defaultValue:{value:"medium"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},invalid:{defaultValue:{value:"false"},description:"Marks the input as invalid (sets aria-invalid + error border)",name:"invalid",required:!1,type:{name:"boolean"}}}}}catch{}const w={title:"Forms/Input",component:a,parameters:{layout:"padded",docs:{description:{component:"Standalone text input. Wrap in FormField for label + hint, or pass `aria-label` directly."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]},invalid:{control:"boolean"},disabled:{control:"boolean"}}},l={args:{"aria-label":"Email",placeholder:"you@example.com",name:"email"}},n={args:{"aria-label":"Email",placeholder:"you@example.com",invalid:!0,defaultValue:"not-an-email"}},t={args:{"aria-label":"Employee ID",defaultValue:"EMP-00421",disabled:!0}},o={render:()=>e.jsxs("div",{className:"stories-stack",children:[e.jsx(a,{size:"small","aria-label":"Small input",placeholder:"Small"}),e.jsx(a,{size:"medium","aria-label":"Medium input",placeholder:"Medium"}),e.jsx(a,{size:"large","aria-label":"Large input",placeholder:"Large"})]})},i={args:{"aria-label":"Email",placeholder:"you@example.com",name:"email"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[r=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(r,{}))]};var d,m,u;l.parameters={...l.parameters,docs:{...(d=l.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    name: 'email'
  }
}`,...(u=(m=l.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var p,c,b;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    invalid: true,
    defaultValue: 'not-an-email'
  }
}`,...(b=(c=n.parameters)==null?void 0:c.docs)==null?void 0:b.source}}};var g,f,h;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Employee ID',
    defaultValue: 'EMP-00421',
    disabled: true
  }
}`,...(h=(f=t.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var v,y,x;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Input size="small" aria-label="Small input" placeholder="Small" />\r
      <Input size="medium" aria-label="Medium input" placeholder="Medium" />\r
      <Input size="large" aria-label="Large input" placeholder="Large" />\r
    </div>
}`,...(x=(y=o.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var S,E,k;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    name: 'email'
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
}`,...(k=(E=i.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};const q=["Default","Invalid","Disabled","Sizes","DarkMode"];export{i as DarkMode,l as Default,t as Disabled,n as Invalid,o as Sizes,q as __namedExportsOrder,w as default};
