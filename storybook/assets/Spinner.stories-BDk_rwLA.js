import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function i({size:a="medium",label:z="Loading"}){const x=["spinner",`spinner-${a}`].join(" ");return e.jsx("span",{className:x,role:"status","aria-label":z,children:e.jsxs("svg",{className:"spinner-svg",viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[e.jsx("circle",{className:"spinner-track",cx:"12",cy:"12",r:"10",fill:"none",strokeWidth:"3"}),e.jsx("circle",{className:"spinner-head",cx:"12",cy:"12",r:"10",fill:"none",strokeWidth:"3",strokeLinecap:"round"})]})})}try{i.displayName="Spinner",i.__docgenInfo={description:`Spinner — loading indicator.

Token-only styling, light + dark via data-theme="dark". Uses role="status"
with aria-label set from the label prop so assistive tech announces it.`,displayName:"Spinner",props:{size:{defaultValue:{value:"medium"},description:"Visual size — defaults to 'medium'",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},label:{defaultValue:{value:"Loading"},description:"Accessible label exposed via aria-label. Defaults to 'Loading'.",name:"label",required:!1,type:{name:"string"}}}}}catch{}const D={title:"Feedback/Spinner",component:i,parameters:{layout:"centered",docs:{description:{component:'Loading spinner with role="status" and accessible label. Use for indeterminate async work that blocks an interaction.'}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]}}},r={args:{size:"medium",label:"Loading"}},s={args:{size:"small",label:"Loading"}},n={args:{size:"large",label:"Loading data"}},t={args:{size:"medium",label:"Saving candidate profile"}},o={args:{size:"medium",label:"Loading"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var l,d,c;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    label: 'Loading'
  }
}`,...(c=(d=r.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var m,u,p;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    size: 'small',
    label: 'Loading'
  }
}`,...(p=(u=s.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var g,b,f;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    size: 'large',
    label: 'Loading data'
  }
}`,...(f=(b=n.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var k,h,y;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    label: 'Saving candidate profile'
  }
}`,...(y=(h=t.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var L,S,v;o.parameters={...o.parameters,docs:{...(L=o.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    label: 'Loading'
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
}`,...(v=(S=o.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};const w=["Default","Small","Large","CustomLabel","DarkMode"];export{t as CustomLabel,o as DarkMode,r as Default,n as Large,s as Small,w as __namedExportsOrder,D as default};
